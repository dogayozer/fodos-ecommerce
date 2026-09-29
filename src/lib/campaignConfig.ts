// Client bileşenlerinin de import edebilmesi için prisma içermeyen kampanya sabitleri.
// Bitirmek için active=false yap (pop-up, üst şerit ve sepet hatırlatması kalkar)
// ve ürünlerdeki Product.campaign alanını temizle.
export const CAMPAIGN = {
  key: 'adaptor',
  path: '/kampanya/adaptor',
  name: 'Adaptör Kampanyası',
  active: true,
}

export type CampaignProduct = {
  id: string
  slug: string
  title: string
  brand: string | null
  sale_price: number
  reference_price: number | null
  stock_qty: number
  campaign: string | null
  images: { url: string }[]
}

export function discountPercent(p: { sale_price: number; reference_price: number | null }): number {
  return p.reference_price && p.reference_price > p.sale_price
    ? Math.round(((p.reference_price - p.sale_price) / p.reference_price) * 100)
    : 0
}
