'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { X } from 'lucide-react'
import { CAMPAIGN, discountPercent, type CampaignProduct } from '@/lib/campaignConfig'

export const CAMPAIGN_SPLASH_KEY = 'campaignSplash'
const DISMISS_HOURS = 24
// Alışveriş/ödeme ve üyelik akışını bölmemek (ve kampanya sayfasında tekrar etmemek) için gösterilmez
const HIDDEN_PREFIXES = ['/admin', '/odeme', '/sepet', '/kayit-ol', '/giris', '/bayi', CAMPAIGN.path]

export function CampaignSplash({ items, maxDiscount, total }: { items: CampaignProduct[]; maxDiscount: number; total: number }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const hidden = HIDDEN_PREFIXES.some((prefix) => pathname?.startsWith(prefix))

  useEffect(() => {
    if (hidden) return
    try {
      const saved = JSON.parse(localStorage.getItem(CAMPAIGN_SPLASH_KEY) || 'null')
      if (saved?.at && Date.now() - saved.at < DISMISS_HOURS * 60 * 60 * 1000) return
    } catch {}
    const timer = setTimeout(() => setOpen(true), 1500)
    return () => clearTimeout(timer)
  }, [hidden])

  const close = () => {
    try { localStorage.setItem(CAMPAIGN_SPLASH_KEY, JSON.stringify({ at: Date.now() })) } catch {}
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (!open || hidden || items.length === 0) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 bg-black/60" onClick={close}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="campaign-splash-title"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-neutral-0 rounded-[var(--radius-xl)] shadow-[var(--shadow-float)]"
      >
        <button
          type="button"
          onClick={close}
          aria-label="Kapat"
          className="absolute top-3 right-3 p-1.5 rounded-full text-white/90 hover:bg-white/20 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="bg-gradient-to-r from-action-orange-500 to-action-orange-600 text-white px-6 pt-7 pb-5 rounded-t-[var(--radius-xl)]">
          <span className="inline-block text-[11px] font-bold uppercase tracking-wider bg-white/20 rounded-full px-3 py-1 mb-2">Kampanya Başladı</span>
          <h2 id="campaign-splash-title" className="text-2xl sm:text-3xl font-black pr-8 leading-tight">{CAMPAIGN.name}</h2>
          <p className="text-sm sm:text-base text-white/90 mt-1">
            {total} adaptör ve şarj ürününde{maxDiscount > 0 ? <> <strong>%{maxDiscount}</strong>'e varan indirim</> : ' kampanyalı fiyatlar'}.
          </p>
        </div>

        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {items.map((p) => {
              const pct = discountPercent(p)
              return (
                <Link
                  key={p.id}
                  href={`/urun/${p.slug}`}
                  onClick={close}
                  className="group border border-neutral-200 rounded-[var(--radius-lg)] overflow-hidden hover:shadow-[var(--shadow-card-hover)] transition-shadow bg-neutral-0 relative"
                >
                  {pct > 0 && (
                    <span className="absolute top-1.5 left-1.5 z-10 bg-action-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">%{pct}</span>
                  )}
                  <div className="aspect-square bg-neutral-50 relative">
                    <Image src={p.images[0].url} alt={p.title} fill sizes="(max-width: 640px) 45vw, 200px" className="object-cover mix-blend-multiply" />
                  </div>
                  <div className="p-2">
                    <div className="text-[11px] leading-tight text-neutral-900 font-medium line-clamp-2 min-h-[2.2em]">{p.title}</div>
                    <div className="mt-1 flex flex-col">
                      {p.reference_price ? <span className="text-[10px] text-neutral-500 line-through">{p.reference_price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</span> : null}
                      <span className="text-sm font-bold text-action-orange-600">{p.sale_price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-5">
            <button
              type="button"
              onClick={close}
              className="sm:col-span-1 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 rounded-[var(--radius-md)] font-semibold transition-colors order-2 sm:order-1"
            >
              Daha Sonra
            </button>
            <Link
              href={CAMPAIGN.path}
              onClick={close}
              className="sm:col-span-2 py-3 bg-action-orange-500 hover:bg-action-orange-600 text-white text-center rounded-[var(--radius-md)] font-bold shadow-[var(--shadow-button)] transition-colors order-1 sm:order-2"
            >
              Kampanyalı Adaptörlere Git →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
