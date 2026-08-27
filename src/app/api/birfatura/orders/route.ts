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
        ProductId: item.productId,
        ProductCode: item.product?.barcode || item.product?.model_code || `PRD-${item.productId}`,
        Barcode: item.product?.barcode || '',
        ProductBrand: item.product?.brand || 'FODOS',
        ProductName: item.product?.title || 'Ürün',
        ProductQuantityType: "Adet",
        ProductQuantity: item.quantity,
        VatRate: defaultVatRate,
        ProductUnitPriceTaxExcluding: item.price,
        ProductUnitPriceTaxIncluding: item.price,
      }))

      if (order.shippingCost && order.shippingCost > 0) {
        birfaturaItems.push({
          ProductId: "shipping",
          ProductCode: "KARGO",
          Barcode: "",
          ProductBrand: "KARGO",
          ProductName: "Kargo Ücreti",
          ProductQuantityType: "Adet",
          ProductQuantity: 1,
          VatRate: defaultVatRate,
          ProductUnitPriceTaxExcluding: order.shippingCost,
          ProductUnitPriceTaxIncluding: order.shippingCost,
        })
      }

      if (order.discountApplied && order.discountApplied > 0) {
        birfaturaItems.push({
          ProductId: "discount",
          ProductCode: "INDIRIM",
          Barcode: "",
          ProductBrand: "INDIRIM",
          ProductName: order.couponCode ? `İndirim (${order.couponCode})` : "İndirim",
          ProductQuantityType: "Adet",
          ProductQuantity: 1,
          VatRate: defaultVatRate,
          ProductUnitPriceTaxExcluding: -order.discountApplied,
          ProductUnitPriceTaxIncluding: -order.discountApplied,
        })
      }

      return {
        OrderId: order.id,
        OrderCode: order.orderNumber,
        OrderDate: new Date(order.createdAt).toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' }),
        InvoiceTypeId: 4,
        InvoiceExplanation: order.adminNote || '',
        CustomerId: order.customer?.id || order.id,
        BillingName: order.companyTitle || customerName,
        BillingAddress: order.shippingAddress || '',
        BillingTown: order.shippingDistrict || '',
        BillingCity: order.shippingCity || '',
        BillingMobilePhone: order.customer?.phone || '',
        TaxOffice: order.taxOffice || '',
        TaxNo: order.taxNumber || '',
        Email: order.customer?.email || '',
        ShippingId: order.customer?.id || order.id,
        ShippingName: customerName,
        ShippingAddress: order.shippingAddress || '',
        ShippingTown: order.shippingDistrict || '',
        ShippingCity: order.shippingCity || '',
        ShippingCountry: 'Türkiye',
        ShippingZipCode: '',
        ShippingPhone: order.customer?.phone || '',
        ShipCompany: order.shippingCompany || '',
        PaymentTypeId: 3,
        PaymentType: 'Kredi Kartı',
        Currency: 'TRY',
        CurrencyRate: 1,
        TotalPaidTaxExcluding: order.totalAmount,
        TotalPaidTaxIncluding: order.totalAmount,
        ProductsTotalTaxExcluding: itemsTotal,
        ProductsTotalTaxIncluding: itemsTotal,
        OrderDetails: birfaturaItems
      }
    })

    return NextResponse.json({
      Orders: formattedOrders
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
