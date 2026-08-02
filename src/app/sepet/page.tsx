import { Metadata } from 'next'
import { CartClient } from './CartClient'

export const metadata: Metadata = {
  title: "Sepetim | Fodos",
  robots: { index: false, follow: false },
};

function getShippingLogic() {
  const now = new Date()
  const options = { timeZone: 'Europe/Istanbul', hour12: false }
  
  // Get current hour and day in Istanbul time
  const istTimeStr = now.toLocaleString('en-US', options)
  const istDate = new Date(istTimeStr)
  const day = istDate.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const hour = istDate.getHours()
  
  let targetTimeMs = 0
  let message = ''

  if (day === 0) {
    message = 'Kargo işlemleri hafta içi devam eder, siparişiniz Pazartesi işleme alınır.'
  } else if (day === 6) {
    if (hour < 12) {
      // Target is today at 12:00
      const target = new Date(istDate)
      target.setHours(12, 0, 0, 0)
      targetTimeMs = now.getTime() + (target.getTime() - istDate.getTime())
    } else {
      message = 'Bir sonraki iş günü kargoya verilir.'
    }
  } else {
    // Weekdays
    if (hour < 15) {
      // Target is today at 15:00
      const target = new Date(istDate)
      target.setHours(15, 0, 0, 0)
      targetTimeMs = now.getTime() + (target.getTime() - istDate.getTime())
    } else {
      message = 'Bir sonraki iş günü kargoya verilir.'
    }
  }

  return { targetTimeMs, message }
}

export default function CartPage() {
  const { targetTimeMs, message } = getShippingLogic()

  return (
    <main className="max-w-4xl mx-auto px-4 py-12 flex-1 w-full">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Sepetim</h1>
      <CartClient targetTimeMs={targetTimeMs} message={message} />
    </main>
  )
}
