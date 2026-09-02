'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, RefreshCw } from 'lucide-react'

interface Account {
  id: string
  platform: string
  accountLabel: string
  apiKey: string | null
  apiSecret: string | null // maskelenmiş halde gelir ("••••••••" veya null)
  supplierId: string | null
  isActive: boolean
  lastSyncAt: string | null
  lastSyncError: string | null
}

const PLATFORMS = [
  { value: 'trendyol', label: 'Trendyol' },
  { value: 'hepsiburada', label: 'Hepsiburada' },
  { value: 'n11', label: 'N11' },
  { value: 'ciceksepeti', label: 'Çiçeksepeti' },
]

const emptyForm = { platform: 'trendyol', accountLabel: '', apiKey: '', apiSecret: '', supplierId: '' }

export function MarketplaceAccountManager() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [syncingId, setSyncingId] = useState<string | null>(null)

  const fetchAccounts = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/marketplace/accounts', { cache: 'no-store' })
    const data = await res.json()
    setAccounts(data.accounts || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchAccounts()
  }, [])

  const handleCreate = async () => {
    if (!form.accountLabel.trim()) return
    setSaving(true)
    await fetch('/api/admin/marketplace/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setForm(emptyForm)
    setShowForm(false)
    setSaving(false)
    fetchAccounts()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu hesabı ve tüm sipariş geçmişini silmek istediğine emin misin?')) return
    await fetch(`/api/admin/marketplace/accounts?id=${id}`, { method: 'DELETE' })
    fetchAccounts()
  }

  const handleToggleActive = async (account: Account) => {
    await fetch('/api/admin/marketplace/accounts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: account.id, isActive: !account.isActive }),
    })
    fetchAccounts()
  }

  const handleSyncNow = async (id: string) => {
    setSyncingId(id)
    try {
      await fetch(`/api/admin/marketplace/sync-now?accountId=${id}`, { method: 'POST' })
    } finally {
      setSyncingId(null)
      fetchAccounts()
    }
  }

  return (
    <div>
      {loading ? (
        <div className="text-center text-gray-400 py-8 text-sm">Yükleniyor…</div>
      ) : (
        <div className="space-y-3 mb-4">
          {accounts.map((acc) => (
            <div key={acc.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold uppercase text-trust-blue-700">{acc.platform}</span>
                <button onClick={() => handleDelete(acc.id)} className="text-gray-300 hover:text-red-600">
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="font-bold text-gray-900 mb-2">{acc.accountLabel}</div>
              <div className="text-xs text-gray-400 mb-3">
                {acc.lastSyncAt ? `Son senkron: ${new Date(acc.lastSyncAt).toLocaleString('tr-TR')}` : 'Henüz senkronize edilmedi'}
                {acc.lastSyncError && <div className="text-red-600 mt-1">⚠ {acc.lastSyncError}</div>}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleToggleActive(acc)}
                  className={`text-xs font-bold px-3 py-2 rounded-lg border-2 ${acc.isActive ? 'border-emerald-300 text-emerald-700 bg-emerald-50' : 'border-gray-200 text-gray-500'}`}
                >
                  {acc.isActive ? 'Aktif' : 'Pasif'}
                </button>
                <button
                  onClick={() => handleSyncNow(acc.id)}
                  disabled={syncingId === acc.id}
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg border-2 border-gray-200 text-gray-700 disabled:opacity-50"
                >
                  <RefreshCw size={13} className={syncingId === acc.id ? 'animate-spin' : ''} />
                  Şimdi Senkronize Et
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm ? (
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
          <select
            value={form.platform}
            onChange={(e) => setForm({ ...form, platform: e.target.value })}
            className="w-full border-2 border-gray-200 rounded-lg p-2.5 text-sm"
          >
            {PLATFORMS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
          <input
            placeholder="Hesap etiketi (örn: Trendyol - Ana Hesap)"
            value={form.accountLabel}
            onChange={(e) => setForm({ ...form, accountLabel: e.target.value })}
            className="w-full border-2 border-gray-200 rounded-lg p-2.5 text-sm"
          />
          <input
            placeholder="Satıcı/Seller ID"
            value={form.supplierId}
            onChange={(e) => setForm({ ...form, supplierId: e.target.value })}
            className="w-full border-2 border-gray-200 rounded-lg p-2.5 text-sm"
          />
          <input
            placeholder="API Key"
            value={form.apiKey}
            onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
            className="w-full border-2 border-gray-200 rounded-lg p-2.5 text-sm font-mono"
          />
          <input
            placeholder="API Secret"
            type="password"
            value={form.apiSecret}
            onChange={(e) => setForm({ ...form, apiSecret: e.target.value })}
            className="w-full border-2 border-gray-200 rounded-lg p-2.5 text-sm font-mono"
          />
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={saving}
              className="flex-1 bg-trust-blue-600 text-white font-bold py-2.5 rounded-lg disabled:opacity-50"
            >
              {saving ? 'Kaydediliyor…' : 'Hesabı Kaydet'}
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2.5 text-gray-500 font-semibold">
              Vazgeç
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 text-gray-500 font-bold py-3.5 rounded-xl"
        >
          <Plus size={18} /> Yeni Hesap Ekle
        </button>
      )}
    </div>
  )
}
