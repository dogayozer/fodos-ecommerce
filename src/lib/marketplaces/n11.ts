import { MarketplaceAccountCreds, MarketplaceClient, MarketplaceOrderDTO } from './types'

// TODO (Plan Faz 3): N11 REST API entegrasyonu — GET /rest/delivery/v1/shipmentPackages,
// header'da appkey/appsecret. Trendyol POC'u doğrulandıktan sonra aynı desenle yazılacak.
export const n11Client: MarketplaceClient = {
  platform: 'n11',
  async fetchNewOrders(_account: MarketplaceAccountCreds, _sinceISO?: string): Promise<MarketplaceOrderDTO[]> {
    throw new Error('N11 entegrasyonu henüz uygulanmadı (Plan Faz 3)')
  },
}
