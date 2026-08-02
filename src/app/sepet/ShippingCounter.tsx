'use client'

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'

export function ShippingCounter({ targetTimeMs, message }: { targetTimeMs?: number, message?: string }) {
  const [timeLeft, setTimeLeft] = useState<{ hours: number, minutes: number } | null>(null)

  useEffect(() => {
    if (!targetTimeMs) return

    const calculateTimeLeft = () => {
      const now = Date.now()
      const diff = targetTimeMs - now
      
      if (diff <= 0) {
        setTimeLeft(null)
        return
      }

      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
      const minutes = Math.floor((diff / 1000 / 60) % 60)
      setTimeLeft({ hours, minutes })
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 60000)

    return () => clearInterval(timer)
  }, [targetTimeMs])

  if (message) {
    return (
      <div className="bg-blue-50 text-trust-blue-600 px-4 py-3 rounded-lg flex items-center text-sm font-semibold border border-blue-100">
        <Clock size={18} className="mr-2" />
        {message}
      </div>
    )
  }

  if (timeLeft) {
    return (
      <div className="bg-orange-50 text-action-orange-600 px-4 py-3 rounded-lg flex items-center text-sm font-semibold border border-orange-100 animate-pulse">
        <Clock size={18} className="mr-2" />
        Bugün kargoya verilir — {timeLeft.hours} saat {timeLeft.minutes} dakika kaldı
      </div>
    )
  }

  return null
}
