'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { X } from 'lucide-react'
import { HOLIDAY_KEY, holidayActive } from '@/lib/holiday'

const DISMISS_HOURS = 12
// Alışveriş/ödeme ve üyelik akışını bölmemek için bu sayfalarda gösterilmez
const HIDDEN_PREFIXES = ['/admin', '/odeme', '/sepet', '/kayit-ol', '/giris', '/bayi']

export function HolidaySplash() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const hidden = HIDDEN_PREFIXES.some((prefix) => pathname?.startsWith(prefix))

  useEffect(() => {
    if (hidden || !holidayActive()) return
    try {
      const saved = JSON.parse(localStorage.getItem(HOLIDAY_KEY) || 'null')
      if (saved?.at && Date.now() - saved.at < DISMISS_HOURS * 60 * 60 * 1000) return
    } catch {}
    const timer = setTimeout(() => setOpen(true), 500)
    return () => clearTimeout(timer)
  }, [hidden])

  const close = () => {
    try { localStorage.setItem(HOLIDAY_KEY, JSON.stringify({ at: Date.now() })) } catch {}
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (!open || hidden) return null

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 bg-black/80" onClick={close}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="29 Ekim Cumhuriyet Bayramı Kutlu Olsun"
        onClick={(e) => e.stopPropagation()}
        className="relative"
      >
        <button
          type="button"
          onClick={close}
          aria-label="Kapat"
          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/29-ekim-cumhuriyet-bayrami.jpg"
          alt="29 Ekim Cumhuriyet Bayramı Kutlu Olsun!"
          width={1080}
          height={1920}
          className="block w-auto h-auto max-w-full max-h-[92vh] rounded-[var(--radius-xl)] shadow-[var(--shadow-float)]"
        />
      </div>
    </div>
  )
}
