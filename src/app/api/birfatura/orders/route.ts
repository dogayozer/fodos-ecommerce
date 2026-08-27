import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

import { timingSafeEqual } from 'crypto'

/**
 * BirFatura Özel Entegrasyon (Custom Store API) Sipariş Listeleme Endpoint'i
 * GET /api/birfatura/orders
 * POST /api/birfatura/orders
 */
async function authenticateRequest(req: Request): Promise<boolean> {
  const url = new URL(req.url)
  const authHeader = req.headers.get('authorization')
  const apiKeyHeader = req.headers.get('x-api-key') || req.headers.get('x-token')
  const queryToken = url.searchParams.get('token') || url.searchParams.get('apiKey') || url.searchParams.get('key')

  let providedToken = queryToken || apiKeyHeader

  if (authHeader && authHeader.startsWith('Bearer ')) {
    providedToken = authHeader.substring(7).trim()
  }

  const settings = await prisma.storeSettings.findUnique({
    where: { id: 'default' }
  })

  const validKey = settings?.birfaturaApiKey || process.env.BIRFATURA_API_KEY || 'fodos_bf_live_key_2026'

  if (!providedToken) {
    return false
  }

  try {
    const providedBuffer = Buffer.from(providedToken)
    const validBuffer = Buffer.from(validKey)
    if (providedBuffer.length !== validBuffer.length) {
      return false
    }
    return timingSafeEqual(providedBuffer, validBuffer)
  } catch (e) {
    return false
  }
}

async function handleGetOrders(req: Request) {
  try {
    const isAuth = await authenticateRequest(req)
    if (!isAuth) {
      return NextResponse.json(
        { status: false, error: 'Unauthorized. Geçersiz veya eksik API Anahtarı.' },
        { status: 200 }
      )
    }

    const url = new URL(req.url)
    const startDate = url.searchParams.get('startDate') || url.searchParams.get('start_date')
    const endDate = url.searchParams.get('endDate') || url.searchParams.get('end_date')
    const status = url.searchParams.get('status')
    const invoiceStatus = url.searchParams.get('invoiceStatus') || url.searchParams.get('invoice_status')
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'))
    const limit = Math.min(500, Math.max(1, parseInt(url.searchParams.get('limit') || '100')))
    const skip = (page - 1) * limit

    const whereClause: any = {}

    // Tarih Filtresi
    if (startDate || endDate) {
      whereClause.createdAt = {}
      if (startDate) {
        whereClause.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        whereClause.createdAt.lte = new Date(endDate)
      }
    }

    // Sipariş Durumu
    if (status && status !== 'all') {
      whereClause.status = status
    }

    // Fatura Durumu Filtresi (Örn: Sadece fatura bekleyenler)
    if (invoiceStatus && invoiceStatus !== 'all') {
      whereClause.invoiceStatus = invoiceStatus
    }

    const settings = await prisma.storeSettings.findUnique({
      where: { id: 'default' }
    })
    const defaultVatRate = settings?.birfaturaKdvRate ?? 20

    const [total, orders] = await Promise.all([
      prisma.order.count({ where: whereClause }),
      prisma.order.findMany({
        where: whereClause,
        include: {
          customer: true,
          items: {
            include: {
              product: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      })
    ])

    // BirFatura Formatına Dönüştürme
    const formattedOrders = orders.map((order) => {
      const customerName = order.customer?.name || 'Misafir Müşteri'
      const nameParts = customerName.trim().split(' ')
      const firstName = nameParts.slice(0, -1).join(' ') || nameParts[0] || ''
      const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : ''

      const itemsTotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

      const birfaturaItems: any[] = order.items.map((item) => ({
        item_id: item.id,
        product_id: item.productId,
        sku: item.product?.barcode || item.product?.model_code || `PRD-${item.productId}`,
        barcode: item.product?.barcode || '',
        name: item.product?.title || 'Ürün',
        model_code: item.product?.model_code || '',
        brand: item.product?.brand || 'FODOS',
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
        vat_rate: defaultVatRate
      }))

      if (order.shippingCost && order.shippingCost > 0) {
        birfaturaItems.push({
          item_id: "shipping",
          product_id: "shipping",
          sku: "KARGO",
          barcode: "",
          name: "Kargo Ücreti",
          model_code: "",
          brand: "KARGO",
          quantity: 1,
          unit_price: order.shippingCost,
          total_price: order.shippingCost,
          vat_rate: defaultVatRate
        })
      }

      if (order.discountApplied && order.discountApplied > 0) {
        birfaturaItems.push({
          item_id: "discount",
          product_id: "discount",
          sku: "INDIRIM",
          barcode: "",
          name: order.couponCode ? `İndirim (${order.couponCode})` : "İndirim",
          model_code: "",
          brand: "",
          quantity: 1,
          unit_price: -order.discountApplied,
          total_price: -order.discountApplied,
          vat_rate: defaultVatRate
        })
      }

      return {
        order_id: order.id,
        order_number: order.orderNumber,
        order_date: order.createdAt.toISOString(),
        order_date_formatted: new Date(order.createdAt).toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' }),
        status: order.status,
        payment_type: 'Kredi Kartı / PayTR',
        payment_status: 'processing',
        currency: 'TRY',
        total_amount: order.totalAmount,
        subtotal: itemsTotal,
        discount_amount: order.discountApplied || 0,
        coupon_code: order.couponCode || null,
        shipping_amount: order.shippingCost || 0,
        customer: {
          id: order.customer?.id || null,
          name: customerName,
          first_name: firstName,
          last_name: lastName,
          email: order.customer?.email || '',
          phone: order.customer?.phone || '',
          tax_number: order.taxNumber || '11111111111', // Bireysel için standart TCKN
          tax_office: order.taxOffice || '',
          company_name: order.companyTitle || ''
        },
        shipping_address: {
          recipient_name: customerName,
          address: order.shippingAddress || '',
          district: order.shippingDistrict || '',
          city: order.shippingCity || '',
          country: 'Türkiye',
          postal_code: '',
          phone: order.customer?.phone || ''
        },
        billing_address: {
          billing_name: order.companyTitle || customerName,
          company_name: order.companyTitle || '',
          tax_number: order.taxNumber || '11111111111',
          tax_office: order.taxOffice || '',
          address: order.shippingAddress || '',
          district: order.shippingDistrict || '',
          city: order.shippingCity || '',
          country: 'Türkiye',
          phone: order.customer?.phone || ''
        },
        items: birfaturaItems,
        cargo: {
          company: order.shippingCompany || '',
          tracking_number: order.trackingNumber || ''
        },
        invoice: {
          status: order.invoiceStatus || 'pending',
          invoice_number: order.invoiceNumber || null,
          invoice_url: order.invoiceUrl || null,
          invoiced_at: order.invoicedAt ? order.invoicedAt.toISOString() : null
        },
        admin_note: order.adminNote || ''
      }
    })

    return NextResponse.json({
      status: true,
      total,
      page,
      limit,
      orders: formattedOrders,
      data: formattedOrders // Alternatif BirFatura standardı için
    })
  } catch (error: any) {
    console.error('BirFatura orders fetch error:', error)
    return NextResponse.json({ status: false, error: error.message }, { status: 200 })
  }
}

export async function GET(req: Request) {
  return handleGetOrders(req)
}

export async function POST(req: Request) {
  return handleGetOrders(req)
}
