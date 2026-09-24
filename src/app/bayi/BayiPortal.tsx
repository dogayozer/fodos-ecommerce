'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Store, Search, Lock, Mail } from 'lucide-react'

interface Props {
  loggedIn: boolean
  isDealer: boolean
  name: string | null
}

export function BayiPortal({ loggedIn, isDealer, name }: Props) {
  if (!loggedIn) return <BayiLogin />
  if (!isDealer) return <NotYetDealer name={name} />
  return <DealerPriceList name={name} />
}

function BayiLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Giriş başarısız')
      window.location.reload()
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-neutral-0 rounded-[var(--radius-xl)] p-8 border border-neutral-200 shadow-[var(--shadow-card)] text-center">
        <div className="w-14 h-14 rounded-full bg-trust-blue-50 text-trust-blue-600 flex items-center justify-center mx-auto mb-4">
          <Store className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-extrabold text-neutral-900 mb-1">Bayi Girişi</h1>
        <p className="text-sm text-neutral-500 mb-6">
          Bayi fiyatlarını görmek için mevcut Fodos hesabınızla giriş yapın.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-risk-red-500/10 text-risk-red-500 text-sm rounded-lg border border-risk-red-500/20 text-left">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-left">
          <div>
            <label className="block text-sm font-medium text-neutral-900 mb-1">E-posta</label>
            <div className="relative">
              <input
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-trust-blue-500 outline-none"
              />
              <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-900 mb-1">Şifre</label>
            <div className="relative">
              <input
                type="password" required value={password} onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-trust-blue-500 outline-none"
              />
              <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full py-3 bg-cta-background hover:bg-cta-hover text-white rounded-lg font-bold shadow-[var(--shadow-button)] transition-colors disabled:opacity-50"
          >
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <p className="text-xs text-neutral-500 mt-5">
          Hesabınız yok mu? <Link href="/kayit-ol" className="text-trust-blue-600 font-semibold hover:underline">Kayıt olun</Link>,
          işletme türünü seçin, ardından bayilik için bizimle iletişime geçin.
        </p>
      </div>
    </div>
  )
}

function NotYetDealer({ name }: { name: string | null }) {
  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <div className="bg-neutral-0 rounded-[var(--radius-xl)] p-8 border border-neutral-200 shadow-[var(--shadow-card)]">
        <div className="w-14 h-14 rounded-full bg-neutral-100 text-neutral-500 flex items-center justify-center mx-auto mb-4">
          <Store className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-extrabold text-neutral-900 mb-2">
          {name ? `Merhaba ${name}, ` : ''}henüz bayi hesabınız yok
        </h1>
        <p className="text-sm text-neutral-500 mb-6">
          Bayi fiyatlarımızdan faydalanmak için ekibimizle iletişime geçin, hesabınız onaylandıktan sonra bu sayfadan
          bayi fiyat listesine ulaşabilirsiniz.
        </p>
        <a
          href="https://wa.me/905322324499" target="_blank" rel="noopener noreferrer"
          className="inline-block py-3 px-6 bg-cta-background hover:bg-cta-hover text-white rounded-lg font-bold shadow-[var(--shadow-button)] transition-colors"
        >
          WhatsApp ile İletişime Geç
        </a>
      </div>
    </div>
  )
}

function DealerPriceList({ name }: { name: string | null }) {
  const [q, setQ] = useState('')
  const [debouncedQ, setDebouncedQ] = useState('')
  const [page, setPage] = useState(1)
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedQ(q); setPage(1) }, 350)
    return () => clearTimeout(t)
  }, [q])

  const fetchPrices = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ page: String(page) })
      if (debouncedQ) params.set('q', debouncedQ)
      const res = await fetch(`/api/dealer/prices?${params}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Yüklenemedi')
      setData(json)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [debouncedQ, page])

  useEffect(() => { fetchPrices() }, [fetchPrices])

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-full bg-trust-blue-50 text-trust-blue-600 flex items-center justify-center">
          <Store className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-neutral-900">Bayi Fiyat Listesi</h1>
          <p className="text-sm text-neutral-500">{name ? `Hoş geldiniz, ${name}.` : ''} {data?.total ?? '...'} üründe bayi fiyatı tanımlı.</p>
        </div>
      </div>

      <div className="relative mb-4">
        <input
          type="text" value={q} onChange={e => setQ(e.target.value)}
          placeholder="Ürün adı, marka, barkod veya model kodu ile ara..."
          className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-[var(--radius-md)] focus:ring-2 focus:ring-trust-blue-500 outline-none bg-neutral-0"
        />
        <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
      </div>

      {error && (
        <div className="p-3 bg-risk-red-500/10 text-risk-red-500 text-sm rounded-lg border border-risk-red-500/20 mb-4">{error}</div>
      )}

      <div className="bg-neutral-0 rounded-[var(--radius-lg)] border border-neutral-200 shadow-[var(--shadow-card)] overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-neutral-500">Yükleniyor...</div>
        ) : !data?.items?.length ? (
          <div className="p-10 text-center text-neutral-500">
            {debouncedQ ? 'Aramanızla eşleşen ürün bulunamadı.' : 'Henüz bayi fiyatı tanımlanmış ürün yok.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="p-3 font-semibold text-neutral-500"></th>
                  <th className="p-3 font-semibold text-neutral-500">Ürün</th>
                  <th className="p-3 font-semibold text-neutral-500">Barkod</th>
                  <th className="p-3 font-semibold text-neutral-500">Stok</th>
                  <th className="p-3 font-semibold text-neutral-500 text-right">Bayi Fiyatı</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {data.items.map((item: any) => (
                  <tr key={item.productId} className="hover:bg-neutral-50">
                    <td className="p-3">
                      <div className="w-10 h-10 bg-neutral-50 rounded flex items-center justify-center border border-neutral-200">
                        {item.image ? (
                          <img src={item.image} alt={item.title} className="max-w-full max-h-full object-contain p-1 mix-blend-multiply" />
                        ) : null}
                      </div>
                    </td>
                    <td className="p-3">
                      <Link href={`/urun/${item.slug}`} className="font-medium text-neutral-900 hover:text-trust-blue-600 line-clamp-2">
                        {item.title}
                      </Link>
                      {item.brand && <div className="text-xs text-neutral-500">{item.brand}</div>}
                    </td>
                    <td className="p-3 font-mono text-xs text-neutral-500">{item.barcode}</td>
                    <td className="p-3">
                      {item.stock_qty > 0 ? (
                        <span className="text-xs font-semibold text-emerald-700">{item.stock_qty} adet</span>
                      ) : (
                        <span className="text-xs font-semibold text-risk-red-500">Tükendi</span>
                      )}
                    </td>
                    <td className="p-3 text-right font-bold text-action-orange-600">
                      {Number(item.dealerPrice).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-5">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
            className="px-4 py-2 rounded-lg border border-neutral-200 text-sm font-semibold disabled:opacity-40 hover:bg-neutral-50"
          >
            Önceki
          </button>
          <span className="text-sm text-neutral-500">Sayfa {data.page} / {data.totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} disabled={page >= data.totalPages}
            className="px-4 py-2 rounded-lg border border-neutral-200 text-sm font-semibold disabled:opacity-40 hover:bg-neutral-50"
          >
            Sonraki
          </button>
        </div>
      )}
    </div>
  )
}
