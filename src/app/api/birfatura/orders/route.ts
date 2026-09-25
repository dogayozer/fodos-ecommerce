import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  authenticateBirfatura,
  formatBirfaturaDate,
  orderNumericId,
  parseBirfaturaDate,
  readJsonBody,
  stableNumericId,
  statusFromId,
} from '@/lib/birfatura'

/**
 * BirFatura Özel Entegrasyon sipariş listesi (POST /api/orders/ → buraya rewrite edilir)
 * İstek: header `token`, body { orderStatusId, startDateTime, endDateTime }
 */
async function handleGetOrders(req: Request) {
  try {
    if (!(await authenticateBirfatura(req))) {
      return NextResponse.json({ status: false, error: 'Unauthorized. Geçersiz veya eksik API Anahtarı.' }, { status: 200 })
    }

    const url = new URL(req.url)
    const body = req.method === 'POST' ? await readJsonBody(req) : {}

    const startDate = parseBirfaturaDate(body.startDateTime ?? url.searchParams.get('startDate') ?? url.searchParams.get('start_date'))
    const endDate = parseBirfaturaDate(body.endDateTime ?? url.searchParams.get('endDate') ?? url.searchParams.get('end_date'))
    const statusId = body.orderStatusId ?? body.OrderStatusId
    const status = statusId != null ? statusFromId(statusId) : url.searchParams.get('status')
    const invoiceStatus = url.searchParams.get('invoiceStatus') || url.searchParams.get('invoice_status')

    const whereClause: any = {}

    if (startDate || endDate) {
      whereClause.createdAt = {}
      if (startDate) whereClause.createdAt.gte = startDate
      if (endDate) whereClause.createdAt.lte = endDate
    }

    if (status && status !== 'all') {
      // BirFatura paneli 'processing' durumunu çekecek şekilde ayarlı; elle 'İşleme Alındı'ya
      // taşınan siparişlerin de kuyruktan düşmemesi için bu durumu da dahil et.
      whereClause.status = status === 'processing' ? { in: ['processing', 'in_progress'] } : status
    } else {
      // Ödenmemiş (pending) ve başarısız (cancelled) siparişler asla faturalanmaya gönderilmez.
      whereClause.status = { notIn: ['pending', 'cancelled'] }
    }

    if (invoiceStatus && invoiceStatus !== 'all') {
      whereClause.invoiceStatus = invoiceStatus
    }

    const settings = await prisma.storeSettings.findUnique({ where: { id: 'default' } })
    const vatRate = settings?.birfaturaKdvRate ?? 20
    const exVat = (amount: number) => amount / (1 + vatRate / 100)

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: { customer: true, items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
      take: 1000,
    })

    const formattedOrders = orders.map((order) => {
      const customerName = order.customer?.name?.trim() || 'Misafir Müşteri'
      const customerNumericId = stableNumericId(order.customer?.id || order.id)
      const itemsTotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const taxNumber = order.taxNumber?.trim() || ''
      const isPersonalId = taxNumber.length === 11 && !order.companyTitle
      const city = order.shippingCity?.trim() || ''
      const town = order.shippingDistrict?.trim() || ''

      return {
        OrderId: orderNumericId(order.orderNumber),
        OrderCode: order.orderNumber,
        OrderDate: formatBirfaturaDate(order.createdAt),
        InvoiceExplanation: order.adminNote || '',
        CustomerId: customerNumericId,
        BillingName: order.companyTitle || customerName,
        BillingAddress: order.shippingAddress || '',
        BillingTown: town,
        BillingCity: city,
        BillingMobilePhone: order.customer?.phone || '',
        TaxOffice: order.taxOffice || '',
        TaxNo: isPersonalId ? '' : taxNumber,
        SSNTCNo: isPersonalId ? taxNumber : '',
        Email: order.customer?.email || '',
        ShippingId: customerNumericId,
        ShippingName: customerName,
        ShippingAddress: order.shippingAddress || '',
        ShippingTown: town,
        ShippingCity: city,
        ShippingCountry: 'Türkiye',
        ShippingZipCode: '',
        ShippingPhone: order.customer?.phone || '',
        ShipCompany: order.shippingCompany || '',
        SalesChannelWebSite: order.store === 'mpm' ? 'mobilparcamerkezi.com' : 'fodos.com.tr',
        PaymentTypeId: 1,
        PaymentType: 'Kredi Kartı',
        Currency: 'TRY',
        CurrencyRate: 1,
        TotalPaidTaxExcluding: exVat(order.totalAmount),
        TotalPaidTaxIncluding: order.totalAmount,
        ProductsTotalTaxExcluding: exVat(itemsTotal),
        ProductsTotalTaxIncluding: itemsTotal,
        ShippingChargeTotalTaxExcluding: exVat(order.shippingCost || 0),
        ShippingChargeTotalTaxIncluding: order.shippingCost || 0,
        DiscountTotalTaxExcluding: exVat(order.discountApplied || 0),
        DiscountTotalTaxIncluding: order.discountApplied || 0,
        OrderDetails: order.items.map((item) => ({
          ProductId: stableNumericId(item.productId),
          ProductCode: item.product?.barcode || item.product?.model_code || item.productId,
          Barcode: item.product?.barcode || '',
          ProductBrand: item.product?.brand || 'FODOS',
          ProductName: item.product?.title || 'Ürün',
          ProductQuantityType: 'Adet',
          ProductQuantity: item.quantity,
          VatRate: vatRate,
          ProductUnitPriceTaxExcluding: exVat(item.price),
          ProductUnitPriceTaxIncluding: item.price,
        })),
      }
    })

    return NextResponse.json({ status: true, Orders: formattedOrders })
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
