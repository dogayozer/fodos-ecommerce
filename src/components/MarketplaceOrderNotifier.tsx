'use client'

import { useEffect, useState, useRef } from 'react'
import { BellRing, X } from 'lucide-react'
import { playNotificationSound } from './OrderNotifier'

// src/components/OrderNotifier.tsx pattern'inin pazaryeri siparişleri karşılığı —
// aynı ses fonksiyonu tekrar kullanılıyor, sadece endpoint ve metinler farklı.
export function MarketplaceOrderNotifier() {
  const [latestOrderId, setLatestOrderId] = useState<string | null>(null)
  const [newOrderAlert, setNewOrderAlert] = useState<{ id: string; orderNumber: string; platform: string; amount: number } | null>(null)
  const isFirstLoad = useRef(true)

  useEffect(() => {
    const checkLatestOrder = async () => {
      try {
        const res = await fetch('/api/admin/marketplace/latest', { cache: 'no-store' })
        if (!res.ok) return

        const data = await res.json()
        const fetchedOrder = data.order

        if (fetchedOrder) {
          if (isFirstLoad.current) {
            setLatestOrderId(fetchedOrder.id)
            isFirstLoad.current = false
          } else {
            setLatestOrderId((prev) => {
              if (prev !== null && prev !== fetchedOrder.id) {
                setNewOrderAlert({
                  id: fetchedOrder.id,
                  orderNumber: fetchedOrder.orderNumber || fetchedOrder.platformOrderId,
                  platform: fetchedOrder.account?.accountLabel || fetchedOrder.account?.platform || 'Pazaryeri',
                  amount: fetchedOrder.totalAmount,
                })
                playNotificationSound()
              }
              return fetchedOrder.id
            })
          }
        }
      } catch (err) {
        console.error('MarketplaceOrderNotifier error:', err)
      }
    }

    checkLatestOrder()
    const intervalId = setInterval(checkLatestOrder, 15000)
    return () => clearInterval(intervalId)
  }, [])

  if (!newOrderAlert) return null

  return (
    <div className="fixed bottom-6 left-6 right-6 md:right-auto z-[9999] animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl shadow-2xl p-4 pr-12 relative md:min-w-[300px] border-2 border-white animate-pulse">
        <button
          onClick={() => setNewOrderAlert(null)}
          className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-full transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex items-start gap-3">
          <div className="bg-white/20 p-2 rounded-full animate-bounce">
            <BellRing size={24} />
          </div>
          <div>
            <h3 className="font-bold text-lg leading-none mb-1 shadow-sm">YENİ PAZARYERİ SİPARİŞİ!</h3>
            <p className="text-orange-50 text-sm">{newOrderAlert.platform} · {newOrderAlert.orderNumber}</p>
            <p className="text-orange-100 font-bold mt-1">{newOrderAlert.amount.toLocaleString('tr-TR')} TL</p>
          </div>
        </div>

        <button
          onClick={() => {
            setNewOrderAlert(null)
            window.location.href = '/admin/pazaryeri-siparisleri'
          }}
          className="mt-3 w-full bg-white text-orange-700 py-2 rounded-lg font-bold shadow-md hover:bg-orange-50 transition-colors"
        >
          Siparişi Görüntüle
        </button>
      </div>
    </div>
  )
}
