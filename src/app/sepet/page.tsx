import { Metadata } from 'next'
import { CartClient } from './CartClient'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = {
  title: "Sepetim | Fodos",
  robots: { index: false, follow: false },
};

async function getShippingLogic() {
  const settings = await prisma.storeSettings.findUnique({ where: { id: 'default' } })
  const sameDayShippingTime = settings?.sameDayShippingTime || '16:00'
  const shippingFee = settings?.shippingFee ?? 110
  const shippingThreshold = settings?.shippingThreshold ?? 500

  const now = new Date()
  const options = { timeZone: 'Europe/Istanbul', hour12: false }
  
  // Get current hour and day in Istanbul time
  const istTimeStr = now.toLocaleString('en-US', options)
  const istDate = new Date(istTimeStr)
  const day = istDate.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const hour = istDate.getHours()
  const minute = istDate.getMinutes()
  
  const [targetHour, targetMinute] = sameDayShippingTime.split(':').map(Number)

  let targetTimeMs = 0
  let message = ''

  if (day === 0) {
    message = 'Kargo işlemleri hafta içi devam eder, siparişiniz Pazartesi işleme alınır.'
  } else if (day === 6) {
    if (hour < 12) {
      // Cumartesi genelde 12'ye kadardır
      const target = new Date(istDate)
      target.setHours(12, 0, 0, 0)
      targetTimeMs = now.getTime() + (target.getTime() - istDate.getTime())
    } else {
      message = 'Bir sonraki iş günü kargoya verilir.'
    }
  } else {
    // Weekdays
    if (hour < targetHour || (hour === targetHour && minute < targetMinute)) {
      const target = new Date(istDate)
      target.setHours(targetHour, targetMinute, 0, 0)
      targetTimeMs = now.getTime() + (target.getTime() - istDate.getTime())
    } else {
      message = 'Bir sonraki iş günü kargoya verilir.'
    }
  }

  return { targetTimeMs, message, shippingFee, shippingThreshold }
}

export default async function CartPage() {
  const { targetTimeMs, message, shippingFee, shippingThreshold } = await getShippingLogic()

  return (
    <main className="max-w-4xl mx-auto px-4 py-12 flex-1 w-full">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Sepetim</h1>
      <CartClient 
        targetTimeMs={targetTimeMs} 
        message={message} 
        shippingFee={shippingFee}
        shippingThreshold={shippingThreshold}
      />
    </main>
  )
}
