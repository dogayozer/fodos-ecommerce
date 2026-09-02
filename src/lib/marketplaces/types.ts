// Pazaryeri entegrasyonları için ortak tipler.
// Her platform (trendyol, hepsiburada, n11, ciceksepeti) kendi dosyasında bu arayüzü
// uygular; senkron/cron katmanı sadece bu ortak şekle bakar, platforma özel detayları bilmez.

export interface MarketplaceAccountCreds {
  id: string
  platform: string
  accountLabel: string
  apiKey: string | null
  apiSecret: string | null
  supplierId: string | null
}

export interface MarketplaceOrderItemDTO {
  platformSku?: string
  barcode?: string
  productName: string
  quantity: number
  unitPrice: number
}

export interface MarketplaceOrderDTO {
  platformOrderId: string
  orderNumber?: string
  customerName?: string
  customerCity?: string
  customerDistrict?: string
  totalAmount: number
  currency?: string
  platformCreatedAt: Date
  items: MarketplaceOrderItemDTO[]
  raw: unknown
}

export interface MarketplaceClient {
  platform: string
  /**
   * Yeni/güncellenen siparişleri çeker. `sinceISO` verilirse sadece o tarihten
   * sonraki siparişler istenir (ilk senkronda undefined — platform kendi
   * varsayılan aralığını kullanır, genelde son birkaç gün).
   */
  fetchNewOrders(account: MarketplaceAccountCreds, sinceISO?: string): Promise<MarketplaceOrderDTO[]>
}
