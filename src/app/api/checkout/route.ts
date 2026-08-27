import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { jwtVerify } from 'jose'
import crypto from 'crypto'

const SECRET_KEY = new TextEncoder().encode('fodos-super-secret-customer-key')

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { customerInfo, cart, couponCode } = body

    if (!cart || cart.length === 0) {
      return NextResponse.json({ error: 'Sepetiniz boş' }, { status: 400 })
    }

    if (!customerInfo.name || !customerInfo.phone || !customerInfo.city || !customerInfo.district || !customerInfo.address) {
      return NextResponse.json({ error: 'Lütfen tüm teslimat bilgilerini doldurun' }, { status: 400 })
    }

    // 1. Get Session / Customer
    const cookieStore: any = cookies()
    const store = cookieStore instanceof Promise ? await cookieStore : cookieStore
    const token = store.get('customer_token')
    
    let dbCustomer = null
    let isLoyalCustomer = false

    if (token) {
      try {
        const { payload } = await jwtVerify(token.value, SECRET_KEY)
        dbCustomer = await prisma.customer.findUnique({
          where: { id: payload.userId as string },
          include: { _count: { select: { orders: true } } }
        })
        if (dbCustomer && dbCustomer._count.orders > 0) {
          isLoyalCustomer = true
        }
      } catch (e) {
        // invalid token, proceed as guest
      }
    }

    if (!dbCustomer) {
      // Try to find by email or create guest
      if (customerInfo.email) {
        dbCustomer = await prisma.customer.findUnique({
          where: { email: customerInfo.email },
          include: { _count: { select: { orders: true } } }
        })
        if (dbCustomer && dbCustomer._count.orders > 0) {
          isLoyalCustomer = true
        }
      }
      
      if (!dbCustomer) {
        dbCustomer = await prisma.customer.create({
          data: {
            email: customerInfo.email || `guest_${Date.now()}@fodos.com`,
            name: customerInfo.name,
            phone: customerInfo.phone,
            city: customerInfo.city,
            district: customerInfo.district,
            address: customerInfo.address,
            isGuest: true
          },
          include: { _count: { select: { orders: true } } }
        })
      }
    }

    // 2. Fetch Settings
    const settings = await prisma.storeSettings.findUnique({ where: { id: 'default' } })
    const shippingFee = settings?.shippingFee ?? 110
    const shippingThreshold = settings?.shippingThreshold ?? 500
    const waPhone = settings?.whatsappPhone || '905322324499'

    // 3. Calculate Totals
    let cartTotal = 0
    // GÜVENLİK ÖNLEMİ: Kullanıcıdan gelen (client-side) fiyata KESİNLİKLE güvenme! 
    // Veritabanından gerçek güncel fiyatı çek ve onunla hesapla.
    const dbCartItems = []
    
    for (const item of cart) {
      const dbProduct = await prisma.product.findUnique({
        where: { id: item.id },
        select: { id: true, sale_price: true, title: true }
      })
      
      if (!dbProduct) {
        return NextResponse.json({ error: `Ürün bulunamadı: ${item.title}` }, { status: 400 })
      }
      
      const realPrice = dbProduct.sale_price
      cartTotal += realPrice * item.qty
      
      // Siparişi oluştururken gerçek fiyatı kullanmak için kaydediyoruz
      dbCartItems.push({
        ...item,
        title: dbProduct.title,
        price: realPrice
      })
    }

    let loyalDiscountAmount = isLoyalCustomer ? (cartTotal * 0.05) : 0

    let couponDiscountAmount = 0
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } })
      if (coupon && coupon.isActive) {
        if (coupon.type === 'percentage') {
          couponDiscountAmount = (cartTotal - loyalDiscountAmount) * (coupon.value / 100)
        } else {
          couponDiscountAmount = coupon.value
        }
      }
    }

    const subTotalAfterDiscounts = Math.max(0, cartTotal - loyalDiscountAmount - couponDiscountAmount)
    const neededForFreeShipping = shippingThreshold - subTotalAfterDiscounts
    const finalShippingCost = (subTotalAfterDiscounts > 0 && neededForFreeShipping > 0) ? shippingFee : 0

    const finalTotal = subTotalAfterDiscounts + finalShippingCost
    const totalDiscountApplied = loyalDiscountAmount + couponDiscountAmount

    // 4. Create Order
    // Sipariş no oluştur (PayTR merchant_oid alfanumerik olmak zorundadır, tire vb. özel karakter kabul etmez)
    const orderNumber = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: dbCustomer.id,
        totalAmount: finalTotal,
        discountApplied: totalDiscountApplied,
        couponCode: couponCode || null,
        shippingCost: finalShippingCost,
        shippingCity: customerInfo.city,
        shippingDistrict: customerInfo.district,
        shippingAddress: customerInfo.address,
        status: 'pending',
        items: {
          create: dbCartItems.map((item: any) => ({
            productId: item.id,
            quantity: item.qty,
            price: item.price
          }))
        }
      }
    })

    // 5. PayTR Integration
    const merchant_id = (process.env.PAYTR_MERCHANT_ID || '735770').trim()
    const merchant_key = (process.env.PAYTR_MERCHANT_KEY || '8Znf7RgqbWaar2B5').trim()
    const merchant_salt = (process.env.PAYTR_MERCHANT_SALT || 'iF9zPQq1UbZ4Xoeo').trim()

    const email = customerInfo.email || `guest_${Date.now()}@fodos.com`
    const payment_amount = Math.round(finalTotal * 100) // Kuruş cinsinden
    const merchant_oid = orderNumber
    const user_name = customerInfo.name
    const user_address = customerInfo.address + ' ' + customerInfo.district + ' ' + customerInfo.city
    const user_phone = customerInfo.phone
    const merchant_ok_url = "https://fodos.com.tr/odeme/basarili"
    const merchant_fail_url = "https://fodos.com.tr/odeme/hata"
    
    // user_basket: [[ItemName, ItemPrice, ItemQty], ...]
    const basketArray = dbCartItems.map((item: any) => [
      item.title,
      item.price.toFixed(2).toString(),
      item.qty
    ])
    
    if (finalShippingCost > 0) {
      basketArray.push(['Kargo Ücreti', finalShippingCost.toFixed(2).toString(), 1])
    }
    if (totalDiscountApplied > 0) {
      // Indirimleri eksi olarak ekleyemiyoruz, sepetin paytr'a sadece gosterim amacli gittigini hatirlayalim.
      // Eger toplam tutar degisiyorsa paytr bunu onemsemez, payment_amount neyse onu ceker.
    }

    const user_basket = Buffer.from(JSON.stringify(basketArray), 'utf8').toString('base64')

    // Gerçek IP adresi veya fallback
    const forwardedFor = req.headers.get('x-forwarded-for')
    const user_ip = forwardedFor ? forwardedFor.split(',')[0].trim() : '85.105.0.0'
    const timeout_limit = "30"
    const debug_on = "1"
    const test_mode = "0" // PayTR test modu kapalı (canlı)
    const no_installment = "0"
    const max_installment = "12"
    const currency = "TL"

    // Hash oluşturma
    const hash_str = merchant_id + user_ip + merchant_oid + email + payment_amount + user_basket + no_installment + max_installment + currency + test_mode
    const paytr_token = crypto.createHmac('sha256', merchant_key).update(hash_str + merchant_salt).digest('base64')

    console.log('PAYTR DEBUG:', { merchant_id, user_ip, merchant_oid, email, payment_amount, test_mode })

    const formData = new URLSearchParams()
    formData.append('merchant_id', merchant_id)
    formData.append('user_ip', user_ip)
    formData.append('merchant_oid', merchant_oid)
    formData.append('email', email)
    formData.append('payment_amount', payment_amount.toString())
    formData.append('paytr_token', paytr_token)
    formData.append('user_basket', user_basket)
    formData.append('debug_on', debug_on)
    formData.append('no_installment', no_installment)
    formData.append('max_installment', max_installment)
    formData.append('user_name', user_name)
    formData.append('user_address', user_address)
    formData.append('user_phone', user_phone)
    formData.append('merchant_ok_url', merchant_ok_url)
    formData.append('merchant_fail_url', merchant_fail_url)
    formData.append('timeout_limit', timeout_limit)
    formData.append('currency', currency)
    formData.append('test_mode', test_mode)

    const paytrRes = await fetch('https://www.paytr.com/odeme/api/get-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData
    })

    const paytrData = await paytrRes.json()

    if (paytrData.status === 'success') {
      return NextResponse.json({
        success: true,
        orderNumber,
        token: paytrData.token
      })
    } else {
      console.error('PayTR Error:', paytrData)
      return NextResponse.json({ error: paytrData.reason || 'Ödeme altyapısı hatası' }, { status: 500 })
    }

  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

