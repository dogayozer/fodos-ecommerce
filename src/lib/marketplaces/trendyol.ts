import { MarketplaceAccountCreds, MarketplaceClient, MarketplaceOrderDTO } from './types'

// Trendyol Entegrasyon API'si — https://developers.trendyol.com
// Auth: Basic (apiKey:apiSecret). sellerId = MarketplaceAccount.supplierId.
// Not (POC aşaması): alan adları (customerFirstName, lines[].stockCode vb.) Trendyol'un
// genel dokümantasyonuna göre yazıldı; gerçek hesapla ilk `sync-now` testinde
// `rawPayload` incelenerek doğrulanacak/gerekirse düzeltilecek — bkz. plan Faz 1.

const BASE_URL = 'https://apigw.trendyol.com/integration/order'

interface TrendyolLine {
  quantity: number
  stockCode?: string
  barcode?: string
  productName?: string
  price?: number
  amount?: number
}

interface TrendyolShipmentPackage {
  id?: number | string
  orderNumber: string
  orderDate?: number // epoch millis
  customerFirstName?: string
  customerLastName?: string
  totalPrice?: number
  grossAmount?: number
  shipmentAddress?: {
    city?: string
    district?: string
  }
  lines?: TrendyolLine[]
}

interface TrendyolResponse {
  content?: TrendyolShipmentPackage[]
  totalPages?: number
  page?: number
}

export const trendyolClient: MarketplaceClient = {
  platform: 'trendyol',

  async fetchNewOrders(account: MarketplaceAccountCreds, sinceISO?: string): Promise<MarketplaceOrderDTO[]> {
    if (!account.apiKey || !account.apiSecret || !account.supplierId) {
      throw new Error('Trendyol hesabı için apiKey/apiSecret/supplierId (sellerId) eksik')
    }

    const auth = Buffer.from(`${account.apiKey}:${account.apiSecret}`).toString('base64')
    const results: MarketplaceOrderDTO[] = []
    const size = 50
    let page = 0
    let totalPages = 1

    const params = new URLSearchParams({ status: 'Created', size: String(size) })
    if (sinceISO) {
      params.set('startDate', String(new Date(sinceISO).getTime()))
    }

    do {
      params.set('page', String(page))
      const url = `${BASE_URL}/sellers/${account.supplierId}/orders?${params.toString()}`

      const res = await fetch(url, {
        headers: {
          Authorization: `Basic ${auth}`,
          'User-Agent': `${account.supplierId} - SelfIntegration`,
        },
      })

      if (!res.ok) {
        const body = await res.text().catch(() => '')
        throw new Error(`Trendyol API ${res.status}: ${body.slice(0, 300)}`)
      }

      const data: TrendyolResponse = await res.json()
      totalPages = data.totalPages ?? 1

      for (const pkg of data.content ?? []) {
        results.push({
          platformOrderId: String(pkg.id ?? pkg.orderNumber),
          orderNumber: pkg.orderNumber,
          customerName: [pkg.customerFirstName, pkg.customerLastName].filter(Boolean).join(' ') || undefined,
          customerCity: pkg.shipmentAddress?.city,
          customerDistrict: pkg.shipmentAddress?.district,
          totalAmount: pkg.totalPrice ?? pkg.grossAmount ?? 0,
          currency: 'TRY',
          platformCreatedAt: pkg.orderDate ? new Date(pkg.orderDate) : new Date(),
          items: (pkg.lines ?? []).map((line) => ({
            platformSku: line.stockCode,
            barcode: line.barcode,
            productName: line.productName || 'Ürün',
            quantity: line.quantity ?? 1,
            unitPrice: line.price ?? line.amount ?? 0,
          })),
          raw: pkg,
        })
      }

      page += 1
    } while (page < totalPages)

    return results
  },
}
