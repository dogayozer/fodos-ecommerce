import { MarketplaceClient } from './types'
import { trendyolClient } from './trendyol'
import { hepsiburadaClient } from './hepsiburada'
import { n11Client } from './n11'
import { ciceksepetiClient } from './ciceksepeti'

const clients: Record<string, MarketplaceClient> = {
  trendyol: trendyolClient,
  hepsiburada: hepsiburadaClient,
  n11: n11Client,
  ciceksepeti: ciceksepetiClient,
}

export function getMarketplaceClient(platform: string): MarketplaceClient {
  const client = clients[platform]
  if (!client) {
    throw new Error(`Bilinmeyen pazaryeri platformu: ${platform}`)
  }
  return client
}

export const SUPPORTED_PLATFORMS = Object.keys(clients)
