import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ProductCard } from '@/components/ProductCard'
import { CAMPAIGN, discountPercent, getCampaignProducts } from '@/lib/campaign'

const PAGE_SIZE = 24

const SORTS = {
  indirim: { label: 'En Yüksek İndirim', fn: (a: any, b: any) => discountPercent(b) - discountPercent(a) || a.sale_price - b.sale_price },
  'fiyat-artan': { label: 'Fiyat: Düşükten Yükseğe', fn: (a: any, b: any) => a.sale_price - b.sale_price },
  'fiyat-azalan': { label: 'Fiyat: Yüksekten Düşüğe', fn: (a: any, b: any) => b.sale_price - a.sale_price },
} as const
type SortKey = keyof typeof SORTS

export const metadata: Metadata = {
  title: 'Adaptör Kampanyası | Hızlı Şarj Adaptörleri Kampanyalı Fiyatlarla | Fodos',
  description: 'Fodos Adaptör Kampanyası: Type-C, hızlı şarj adaptörleri ve şarj kabloları kampanyalı fiyatlarla. Telefon modelinize uygun adaptörü seçin.',
  alternates: { canonical: 'https://www.fodos.com.tr/kampanya/adaptor' },
}

export default async function AdaptorKampanyasiPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  if (!CAMPAIGN.active) notFound()

  const sp = await searchParams
  const sirala: SortKey = typeof sp.sirala === 'string' && sp.sirala in SORTS ? (sp.sirala as SortKey) : 'indirim'

  const all = await getCampaignProducts()
  const sorted = [...all].sort(SORTS[sirala].fn)
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const requested = parseInt(typeof sp.sayfa === 'string' ? sp.sayfa : '1', 10)
  const sayfa = Math.min(totalPages, Math.max(1, Number.isFinite(requested) ? requested : 1))
  const items = sorted.slice((sayfa - 1) * PAGE_SIZE, sayfa * PAGE_SIZE)
  const maxDiscount = Math.max(0, ...all.map(discountPercent))

  const href = (page: number, sort: SortKey) => {
    const q = new URLSearchParams()
    if (sort !== 'indirim') q.set('sirala', sort)
    if (page > 1) q.set('sayfa', String(page))
    const s = q.toString()
    return `${CAMPAIGN.path}${s ? `?${s}` : ''}`
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full">
      <div className="rounded-[var(--radius-2xl)] bg-gradient-to-r from-action-orange-500 to-action-orange-600 text-white p-6 sm:p-10 mb-6 shadow-[var(--shadow-card)]">
        <span className="inline-block text-[11px] sm:text-xs font-bold uppercase tracking-wider bg-white/20 rounded-full px-3 py-1 mb-3">Kampanya</span>
        <h1 className="text-2xl sm:text-4xl font-black leading-tight">Adaptör Kampanyası</h1>
        <p className="mt-2 text-sm sm:text-lg text-white/90">
          {all.length} ürün kampanyalı fiyatlarla{maxDiscount > 0 ? <> — <strong>%{maxDiscount}</strong>'e varan indirim</> : null}.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <p className="text-sm text-neutral-500">{all.length} kampanyalı ürün</p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(SORTS) as SortKey[]).map((key) => (
            <Link
              key={key}
              href={href(1, key)}
              className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium border transition-colors ${
                sirala === key
                  ? 'bg-action-orange-500 text-white border-action-orange-500'
                  : 'bg-neutral-0 text-neutral-900 border-neutral-200 hover:border-action-orange-500'
              }`}
            >
              {SORTS[key].label}
            </Link>
          ))}
        </div>
      </div>

      {items.length === 0 ? (
        <p className="text-center text-neutral-500 py-16">Kampanyalı ürün bulunamadı.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <nav className="flex flex-wrap items-center justify-center gap-2 mt-8" aria-label="Sayfalar">
          {sayfa > 1 && (
            <Link href={href(sayfa - 1, sirala)} className="px-3 py-1.5 rounded-lg border border-neutral-200 text-sm hover:border-action-orange-500">Önceki</Link>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <Link
              key={n}
              href={href(n, sirala)}
              aria-current={n === sayfa ? 'page' : undefined}
              className={`w-9 h-9 flex items-center justify-center rounded-lg border text-sm ${
                n === sayfa ? 'bg-action-orange-500 text-white border-action-orange-500' : 'border-neutral-200 hover:border-action-orange-500'
              }`}
            >
              {n}
            </Link>
          ))}
          {sayfa < totalPages && (
            <Link href={href(sayfa + 1, sirala)} className="px-3 py-1.5 rounded-lg border border-neutral-200 text-sm hover:border-action-orange-500">Sonraki</Link>
          )}
        </nav>
      )}
    </div>
  )
}
