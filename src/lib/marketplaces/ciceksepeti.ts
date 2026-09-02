import { MarketplaceAccountCreds, MarketplaceClient, MarketplaceOrderDTO } from './types'

// TODO (Plan Faz 3): Çiçeksepeti Pazaryeri API entegrasyonu. Endpoint dokümantasyonu
// bayi.ciceksepeti.com panelinden teyit edilecek, Trendyol POC'u sonrası yazılacak.
export const ciceksepetiClient: MarketplaceClient = {
  platform: 'ciceksepeti',
  async fetchNewOrders(_account: MarketplaceAccountCreds, _sinceISO?: string): Promise<MarketplaceOrderDTO[]> {
    throw new Error('Çiçeksepeti entegrasyonu henüz uygulanmadı (Plan Faz 3)')
  },
}
