import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { jwtVerify } from 'jose'

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
    for (const item of cart) {
      cartTotal += item.price * item.qty
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
    const orderNumber = 'FDS' + Math.floor(100000 + Math.random() * 900000)

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
          create: cart.map((item: any) => ({
            productId: item.id,
            quantity: item.qty,
            price: item.price
          }))
        }
      }
    })

    // 5. Build WhatsApp Message
    let message = `Merhaba, sipariş vermek istiyorum:\n\n`
    message += `*Sipariş No:* ${orderNumber}\n`
    message += `*Müşteri:* ${customerInfo.name}\n`
    message += `*Telefon:* ${customerInfo.phone}\n\n`
    
    cart.forEach((item: any) => {
      message += `- ${item.qty} adet ${item.title} (${Number(item.price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL)\n`
    })

    message += `\n*Ara Toplam:* ${cartTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL\n`
    
    if (loyalDiscountAmount > 0) {
      message += `*Daimi Müşteri İndirimi:* -${loyalDiscountAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL\n`
    }
    
    if (couponDiscountAmount > 0) {
      message += `*Kupon İndirimi:* -${couponDiscountAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL\n`
    }

    message += `*Kargo:* ${finalShippingCost > 0 ? finalShippingCost.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) + ' TL' : 'Ücretsiz'}\n`
    message += `*Genel Toplam:* ${finalTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL\n\n`
    
    message += `Siparişimi onaylamak ve ödeme adımlarını tamamlamak istiyorum.`

    const whatsappUrl = `https://wa.me/${waPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`

    return NextResponse.json({
      success: true,
      orderNumber,
      whatsappUrl
    })

  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
