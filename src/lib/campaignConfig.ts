// Client bileşenlerinin de import edebilmesi için prisma içermeyen kampanya sabitleri.
// active=false: pop-up, üst şerit, sepet hatırlatması, kart etiketi kalkar; kampanya sayfası kategoriye
// yönlendirir ve sitemap'ten çıkar. (Fiyatlar ayrıdır: geri almak için kampanya yedeğinden yazılır.)
// Yeniden açmak için active=true yapıp yayına al.
export const CAMPAIGN = {
  key: 'adaptor',
  path: '/kampanya/adaptor',
  name: 'Adaptör Kampanyası',
  active: false,
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
