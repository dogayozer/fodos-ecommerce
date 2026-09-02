'use client'

import { useEffect, useState, useCallback } from 'react'
import { RefreshCw, Package, Clock, CheckCircle2, X } from 'lucide-react'
import Link from 'next/link'

type Tab = 'new' | 'processing' | 'supplied'

interface MarketplaceOrderItem {
  id: string
  productName: string
  quantity: number
  unitPrice: number
}

interface MarketplaceOrder {
  id: string
  orderNumber: string | null
  platformOrderId: string
  customerName: string | null
  customerCity: string | null
  totalAmount: number
  status: string
  supplierNote: string | null
  supplyCost: number | null
  platformCreatedAt: string
  account: { platform: string; accountLabel: string }
  items: MarketplaceOrderItem[]
}

const TABS: { key: Tab; label: string; icon: typeof Package }[] = [
  { key: 'new', label: 'Yeni Gelenler', icon: Package },
  { key: 'processing', label: 'İşleme Alınanlar', icon: Clock },
  { key: 'supplied', label: 'Tedarik Edildi', icon: CheckCircle2 },
]

const PLATFORM_STYLES: Record<string, string> = {
  trendyol: 'bg-orange-100 text-orange-800 border-orange-300',
  hepsiburada: 'bg-orange-100 text-orange-900 border-orange-400',
  n11: 'bg-red-100 text-red-800 border-red-300',
  ciceksepeti: 'bg-pink-100 text-pink-800 border-pink-300',
}

function PlatformBadge({ account }: { account: MarketplaceOrder['account'] }) {
  const style = PLATFORM_STYLES[account.platform] || 'bg-gray-100 text-gray-800 border-gray-300'
  return (
    <span className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded-full border ${style}`}>
      {account.accountLabel}
    </span>
  )
}

export function MarketplaceOrderManager() {
  const [tab, setTab] = useState<Tab>('new')
  const [orders, setOrders] = useState<MarketplaceOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [supplyModalOrder, setSupplyModalOrder] = useState<MarketplaceOrder | null>(null)

  const fetchOrders = useCallback(async (status: Tab) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/marketplace/orders?status=${status}`, { cache: 'no-store' })
      const data = await res.json()
      setOrders(data.orders || [])
    } catch (e) {
      console.error('Sipariş listesi alınamadı', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders(tab)
  }, [tab, fetchOrders])

  const updateOrder = async (id: string, patch: Record<string, unknown>) => {
    await fetch('/api/admin/marketplace/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...patch }),
    })
    fetchOrders(tab)
  }

  const syncAllNow = async () => {
    setSyncing(true)
    try {
      const accRes = await fetch('/api/admin/marketplace/accounts')
      const { accounts } = await accRes.json()
      for (const acc of accounts.filter((a: any) => a.isActive)) {
        await fetch(`/api/admin/marketplace/sync-now?accountId=${acc.id}`, { method: 'POST' }).catch(() => {})
      }
      await fetchOrders(tab)
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div>
      {/* Sekmeler — büyük dokunma alanlı */}
      <div className="grid grid-cols-3 gap-1.5 mb-4 sticky top-0 z-10 bg-gray-50 pt-1 pb-2">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex flex-col items-center justify-center gap-1 py-3 rounded-xl border-2 text-xs font-bold transition-colors ${
              tab === key
                ? 'bg-trust-blue-600 text-white border-trust-blue-600'
                : 'bg-white text-gray-600 border-gray-200'
            }`}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between mb-3">
        <Link href="/admin/pazaryeri-hesaplari" className="text-xs text-trust-blue-600 font-semibold underline">
          Hesapları Yönet
        </Link>
        <button
          onClick={syncAllNow}
          disabled={syncing}
          className="flex items-center gap-1.5 text-xs font-bold bg-white border-2 border-gray-200 px-3 py-2 rounded-lg disabled:opacity-50"
        >
          <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
          {syncing ? 'Senkronize ediliyor…' : 'Şimdi Senkronize Et'}
        </button>
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-12 text-sm">Yükleniyor…</div>
      ) : orders.length === 0 ? (
        <div className="text-center text-gray-400 py-12 text-sm">Bu sekmede sipariş yok.</div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <PlatformBadge account={order.account} />
                <span className="text-[11px] text-gray-400 font-mono">
                  {new Date(order.platformCreatedAt).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div className="text-sm font-bold text-gray-900 mb-0.5">
                {order.orderNumber || order.platformOrderId}
              </div>
              {order.customerName && (
                <div className="text-xs text-gray-500 mb-2">
                  {order.customerName}{order.customerCity ? ` · ${order.customerCity}` : ''}
                </div>
              )}

              <ul className="text-xs text-gray-700 mb-2 space-y-0.5">
                {order.items.map((item) => (
                  <li key={item.id}>
                    {item.quantity}× {item.productName}
                  </li>
                ))}
              </ul>

              <div className="flex items-center justify-between mb-3">
                <span className="text-base font-extrabold text-gray-900">
                  {order.totalAmount.toLocaleString('tr-TR')} TL
                </span>
                {order.status === 'supplied' && order.supplyCost != null && (
                  <span className="text-xs text-emerald-700 font-semibold">
                    Maliyet: {order.supplyCost.toLocaleString('tr-TR')} TL
                  </span>
                )}
              </div>

              {order.status === 'supplied' && order.supplierNote && (
                <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-2 mb-2">
                  📝 {order.supplierNote}
                </div>
              )}

              {order.status === 'new' && (
                <button
                  onClick={() => updateOrder(order.id, { status: 'processing' })}
                  className="w-full bg-trust-blue-600 text-white font-bold py-3 rounded-xl active:scale-[0.98] transition-transform"
                >
                  İşleme Al
                </button>
              )}
              {order.status === 'processing' && (
                <button
                  onClick={() => setSupplyModalOrder(order)}
                  className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl active:scale-[0.98] transition-transform"
                >
                  Tedarik Edildi
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {supplyModalOrder && (
        <SupplyModal
          order={supplyModalOrder}
          onClose={() => setSupplyModalOrder(null)}
          onSave={async (supplierNote, supplyCost) => {
            await updateOrder(supplyModalOrder.id, { status: 'supplied', supplierNote, supplyCost })
            setSupplyModalOrder(null)
          }}
        />
      )}
    </div>
  )
}

function SupplyModal({
  order,
  onClose,
  onSave,
}: {
  order: MarketplaceOrder
  onClose: () => void
  onSave: (supplierNote: string, supplyCost: string) => Promise<void>
}) {
  const [note, setNote] = useState(order.supplierNote || '')
  const [cost, setCost] = useState(order.supplyCost != null ? String(order.supplyCost) : '')
  const [saving, setSaving] = useState(false)

  return (
    <div className="fixed inset-0 z-[9998] bg-black/40 flex items-end md:items-center justify-center" onClick={onClose}>
      <div
        className="bg-white w-full md:max-w-md rounded-t-2xl md:rounded-2xl p-5 pb-8 md:pb-5 animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-gray-900">Tedarik Bilgisi</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-700">
            <X size={22} />
          </button>
        </div>

        <label className="block text-xs font-bold text-gray-600 mb-1">Nereden / Kimden Alındı</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Örn: Tahtakale - Ahmet Usta"
          rows={2}
          className="w-full border-2 border-gray-200 rounded-xl p-3 text-sm mb-4 focus:border-trust-blue-500 focus:outline-none"
        />

        <label className="block text-xs font-bold text-gray-600 mb-1">Tedarik Maliyeti (₺)</label>
        <input
          type="number"
          inputMode="decimal"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          placeholder="0.00"
          className="w-full border-2 border-gray-200 rounded-xl p-3 text-lg font-bold mb-5 focus:border-trust-blue-500 focus:outline-none"
        />

        <button
          disabled={saving}
          onClick={async () => {
            setSaving(true)
            await onSave(note, cost)
            setSaving(false)
          }}
          className="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-xl disabled:opacity-50"
        >
          {saving ? 'Kaydediliyor…' : 'Kaydet ve Tamamla'}
        </button>
      </div>
    </div>
  )
}
