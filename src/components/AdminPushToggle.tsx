'use client'

import { useEffect, useState } from 'react'
import { Bell, BellOff } from 'lucide-react'

function urlBase64ToUint8Array(b64: string) {
  const padding = '='.repeat((4 - (b64.length % 4)) % 4)
  const raw = atob((b64 + padding).replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from(raw, (c) => c.charCodeAt(0))
}

export function AdminPushToggle() {
  const [supported, setSupported] = useState(false)
  const [enabled, setEnabled] = useState(false)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) return
    setSupported(true)
    navigator.serviceWorker.register('/admin-sw.js', { scope: '/admin' })
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setEnabled(!!sub))
      .catch(() => {})
  }, [])

  if (!supported) return null

  const toggle = async () => {
    setBusy(true)
    setMsg('')
    try {
      const reg = await navigator.serviceWorker.register('/admin-sw.js', { scope: '/admin' })
      await navigator.serviceWorker.ready
      const existing = await reg.pushManager.getSubscription()
      if (existing) {
        await fetch('/api/admin/push', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ endpoint: existing.endpoint }) })
        await existing.unsubscribe()
        setEnabled(false)
      } else {
        const perm = await Notification.requestPermission()
        if (perm !== 'granted') { setMsg('Bildirim izni verilmedi.'); return }
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
        })
        const res = await fetch('/api/admin/push', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sub.toJSON()) })
        if (!res.ok) throw new Error('kayıt başarısız')
        setEnabled(true)
      }
    } catch (e: any) {
      setMsg('Bildirim açılamadı: ' + (e?.message || 'bilinmeyen hata'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button
        onClick={toggle}
        disabled={busy}
        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border disabled:opacity-60 ${enabled ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-neutral-0 text-neutral-900 border-neutral-200 hover:bg-neutral-100'}`}
      >
        {enabled ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
        {enabled ? 'Bu cihazda bildirim açık (kapat)' : 'Bu cihazda yeni sipariş bildirimi aç'}
      </button>
      {msg && <span className="text-[11px] text-red-600">{msg}</span>}
    </div>
  )
}
