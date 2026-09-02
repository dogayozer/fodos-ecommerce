import { MarketplaceAccountCreds, MarketplaceClient, MarketplaceOrderDTO } from './types'

// TODO (Plan Faz 3): Hepsiburada MPOP/HMS API entegrasyonu. Trendyol POC'u
// (src/lib/marketplaces/trendyol.ts) doğrulandıktan sonra aynı desenle yazılacak.
export const hepsiburadaClient: MarketplaceClient = {
  platform: 'hepsiburada',
  async fetchNewOrders(_account: MarketplaceAccountCreds, _sinceISO?: string): Promise<MarketplaceOrderDTO[]> {
    throw new Error('Hepsiburada entegrasyonu henüz uygulanmadı (Plan Faz 3)')
  },
}
