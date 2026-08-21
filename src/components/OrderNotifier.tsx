'use client'

import { useEffect, useState, useRef } from 'react'
import { BellRing, X } from 'lucide-react'

export function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // First tone
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, ctx.currentTime); 
    gain1.gain.setValueAtTime(0, ctx.currentTime);
    gain1.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
    gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    
    // Second tone (slightly delayed)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1108.73, ctx.currentTime + 0.1); 
    gain2.gain.setValueAtTime(0, ctx.currentTime + 0.1);
    gain2.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);

    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.5);
    
    osc2.start(ctx.currentTime + 0.1);
    osc2.stop(ctx.currentTime + 0.8);
  } catch (e) {
    console.log('Audio API not supported or blocked', e);
  }
}

export function OrderNotifier() {
  const [latestOrderId, setLatestOrderId] = useState<string | null>(null)
  const [newOrderAlert, setNewOrderAlert] = useState<{ id: string, orderNumber: string, amount: number } | null>(null)
  const isFirstLoad = useRef(true)

  useEffect(() => {
    const checkLatestOrder = async () => {
      try {
        const res = await fetch('/api/admin/latest-order', { cache: 'no-store' })
        if (!res.ok) return
        
        const data = await res.json()
        const fetchedOrder = data.order

        if (fetchedOrder) {
          if (isFirstLoad.current) {
            // İlk yüklemede sadece referans al, uyarı verme
            setLatestOrderId(fetchedOrder.id)
            isFirstLoad.current = false
          } else {
            // Daha sonraki kontrollerde ID değişmişse yeni sipariş var demektir
            setLatestOrderId((prev) => {
              if (prev !== null && prev !== fetchedOrder.id) {
                // YENİ SİPARİŞ!
                setNewOrderAlert({
                  id: fetchedOrder.id,
                  orderNumber: fetchedOrder.orderNumber,
                  amount: fetchedOrder.totalAmount
                })
                playNotificationSound()
              }
              return fetchedOrder.id
            })
          }
        }
      } catch (err) {
        console.error("OrderNotifier error:", err)
      }
    }

    // İlk yüklemede çalıştır
    checkLatestOrder()

    // Her 15 saniyede bir kontrol et
    const intervalId = setInterval(checkLatestOrder, 15000)

    return () => clearInterval(intervalId)
  }, [])

  if (!newOrderAlert) return null

  return (
    <div className="fixed bottom-6 left-6 z-[9999] animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl shadow-2xl p-4 pr-12 relative min-w-[300px] border-2 border-white animate-pulse">
        
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
            <h3 className="font-bold text-lg leading-none mb-1 shadow-sm">YENİ SİPARİŞ GELDİ!</h3>
            <p className="text-green-50 text-sm">Sipariş No: {newOrderAlert.orderNumber}</p>
            <p className="text-green-100 font-bold mt-1">{newOrderAlert.amount.toLocaleString('tr-TR')} TL</p>
          </div>
        </div>

        <button 
          onClick={() => {
            setNewOrderAlert(null)
            window.location.href = '/admin/siparisler'
          }}
          className="mt-3 w-full bg-white text-green-700 py-2 rounded-lg font-bold shadow-md hover:bg-green-50 transition-colors"
        >
          Siparişi Görüntüle
        </button>
      </div>
    </div>
  )
}
