'use client'

import { useState, useEffect } from 'react'
import { Store } from 'lucide-react'

export function DealerPriceManager() {
  const [stats, setStats] = useState<{ count: number; avgPrice: number | null } | null>(null)
  const [percent, setPercent] = useState('20')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ updatedCount: number } | null>(null)
  const [error, setError] = useState('')

  const fetchStats = () => {
    fetch('/api/admin/dealer-prices')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(() => {})
  }

  useEffect(() => { fetchStats() }, [])

  const handleGenerate = async () => {
    const pct = parseFloat(percent)
    if (!(pct > 0 && pct < 100)) {
      setError('Lütfen 0-100 arasında bir indirim oranı girin.')
      return
    }
    if (!window.confirm(`Tüm aktif ürünlerin güncel satış fiyatından %${pct} indirimle bayi fiyat listesi oluşturulacak/güncellenecek. Devam edilsin mi?`)) return

    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/admin/dealer-prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ percent: pct }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Bir hata oluştu')
      setResult({ updatedCount: data.updatedCount })
      fetchStats()
    } catch (e: any) {
      setError(e.message || 'Bağlantı hatası.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 bg-white border border-amber-200 rounded-xl shadow-sm">
      <h2 className="text-lg font-semibold mb-1 text-neutral-900 flex items-center gap-2">
        <Store className="w-5 h-5 text-amber-600" /> Bayi Fiyat Yönetimi
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        Aktif ürünlerin güncel satış fiyatından toplu indirimle bayi fiyat listesi oluşturur. Bayi statüsündeki üyeler
        bu fiyatları /bayi sayfasında görür. {stats && (
          <>Şu an <strong>{stats.count}</strong> ürünün bayi fiyatı tanımlı{stats.avgPrice ? ` (ortalama ${stats.avgPrice.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} TL)` : ''}.</>
        )}
      </p>

      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-sm font-medium text-neutral-900 mb-1">İndirim Oranı (%)</label>
          <input
            type="number"
            min={1}
            max={99}
            value={percent}
            onChange={e => setPercent(e.target.value)}
            className="w-32 px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="py-2.5 px-5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
        >
          {loading ? 'Oluşturuluyor...' : 'Bayi Fiyatlarını Oluştur / Güncelle'}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-100 text-sm">{error}</div>
      )}
      {result && (
        <div className="mt-4 p-3 bg-emerald-50 text-emerald-800 rounded-md border border-emerald-100 text-sm">
          {result.updatedCount} ürünün bayi fiyatı güncellendi.
        </div>
      )}
    </div>
  )
}
