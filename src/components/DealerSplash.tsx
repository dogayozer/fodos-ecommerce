'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { X } from 'lucide-react'
import { BUSINESS_TYPES } from '@/lib/accountTypes'

const STORAGE_KEY = 'dealerSplash'
const DISMISS_DAYS = 7
// Alışveriş/ödeme ve üyelik akışını bölmemek için bu sayfalarda gösterilmez
const HIDDEN_PREFIXES = ['/admin', '/odeme', '/sepet', '/kayit-ol', '/giris']

export function DealerSplash() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', email: '', businessType: '', marketingConsent: false })
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle')
  const [error, setError] = useState('')

  const hidden = HIDDEN_PREFIXES.some(prefix => pathname?.startsWith(prefix))

  useEffect(() => {
    if (hidden) return
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
      if (saved?.status === 'subscribed') return
      if (saved?.status === 'dismissed' && Date.now() - saved.at < DISMISS_DAYS * 24 * 60 * 60 * 1000) return
    } catch {}
    const timer = setTimeout(() => setOpen(true), 3000)
    return () => clearTimeout(timer)
  }, [hidden])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const remember = (value: object) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(value)) } catch {}
  }

  const close = () => {
    if (status !== 'done') remember({ status: 'dismissed', at: Date.now() })
    setOpen(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setStatus('sending')
    try {
      const res = await fetch('/api/dealer-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Kayıt yapılamadı.')
      remember({ status: 'subscribed' })
      setStatus('done')
    } catch (err: any) {
      setError(err.message || 'Bağlantı hatası oluştu.')
      setStatus('idle')
    }
  }

  if (!open || hidden) return null

  const inputClass = 'w-full px-3.5 py-2.5 border border-neutral-200 rounded-[var(--radius-md)] text-sm focus:ring-2 focus:ring-trust-blue-500 outline-none bg-neutral-0'

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dealer-splash-title"
        className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-neutral-0 rounded-[var(--radius-xl)] shadow-[var(--shadow-float)] border border-neutral-200"
      >
        <button
          type="button"
          onClick={close}
          aria-label="Kapat"
          className="absolute top-3 right-3 p-1.5 rounded-full text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="bg-trust-blue-50 border-b border-trust-blue-100 px-6 pt-7 pb-5 rounded-t-[var(--radius-xl)]">
          <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-action-orange-600 mb-1">Yakında</span>
          <h2 id="dealer-splash-title" className="text-xl font-extrabold text-trust-blue-600 pr-8">
            Bayi portalımız yakında hizmetinizde!
          </h2>
          <p className="text-sm text-neutral-500 mt-1.5">
            Bayi fiyatları ve kısa süreli kampanyalar için bültenimize üye olun.
          </p>
        </div>

        {status === 'done' ? (
          <div className="px-6 py-8 text-center">
            <p className="text-lg font-bold text-neutral-900">Teşekkürler! 🎉</p>
            <p className="text-sm text-neutral-500 mt-1">Bayi portalımız açıldığında sizi ilk biz haberdar edeceğiz.</p>
            <button
              type="button"
              onClick={close}
              className="mt-6 w-full py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 rounded-[var(--radius-md)] font-semibold transition-colors"
            >
              Kapat
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-3">
            <input
              type="text" placeholder="Ad Soyad"
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              className={inputClass}
            />
            <input
              type="tel" required placeholder="Telefon * (05XX XXX XX XX)"
              value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
              className={inputClass}
            />
            <input
              type="email" placeholder="E-posta"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              className={inputClass}
            />
            <select
              value={form.businessType} onChange={e => setForm({ ...form, businessType: e.target.value })}
              className={inputClass}
            >
              <option value="">İşletme türü</option>
              {BUSINESS_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox" required
                checked={form.marketingConsent}
                onChange={e => setForm({ ...form, marketingConsent: e.target.checked })}
                className="mt-0.5 w-4 h-4 text-trust-blue-600 rounded border-neutral-200 focus:ring-trust-blue-500"
              />
              <span className="text-xs text-neutral-500 leading-relaxed">
                Bayi fiyatları ve kampanyalar hakkında SMS / e-posta ile bilgilendirilmeyi kabul ediyorum.{' '}
                <Link href="/kvkk" target="_blank" className="text-trust-blue-600 font-semibold hover:underline">KVKK Aydınlatma Metni</Link>
              </span>
            </label>

            {error && (
              <div className="text-xs text-risk-red-500 bg-risk-red-500/10 border border-risk-red-500/20 rounded-[var(--radius-md)] p-2.5">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={close}
                className="py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 rounded-[var(--radius-md)] font-semibold transition-colors"
              >
                Kapat
              </button>
              <button
                type="submit"
                disabled={status === 'sending'}
                className="py-3 bg-cta-background hover:bg-cta-hover text-white rounded-[var(--radius-md)] font-bold shadow-[var(--shadow-button)] transition-colors disabled:opacity-50"
              >
                {status === 'sending' ? 'Gönderiliyor...' : 'Üye Ol'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
