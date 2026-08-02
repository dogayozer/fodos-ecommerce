import Link from 'next/link'
import { ShippingCounter } from './ShippingCounter'
import { ShieldCheck, ArrowRight } from 'lucide-react'
import { Metadata } from 'next'

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

  // Mock cart items for demonstration
  const cartTotal = 750 // Example total
  const freeShippingThreshold = 950
  const neededForFreeShipping = freeShippingThreshold - cartTotal

  return (
    <main className="max-w-4xl mx-auto px-4 py-12 flex-1 w-full">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Sepetim</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          {/* Shipping Counter */}
          <ShippingCounter targetTimeMs={targetTimeMs} message={message} />
          
          {/* Cart Items Mock */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-gray-500 text-center py-8">Sepetinizde ürün bulunmamaktadır.</p>
          </div>
        </div>

        <div className="md:col-span-1">
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Sipariş Özeti</h2>
            
            <div className="flex justify-between mb-2 text-gray-600">
              <span>Ara Toplam</span>
              <span>{cartTotal} TL</span>
            </div>
            
            <div className="flex justify-between mb-4 text-gray-600">
              <span>Kargo</span>
              <span>{neededForFreeShipping > 0 ? '49.90 TL' : 'Ücretsiz'}</span>
            </div>

            <hr className="border-gray-200 mb-4" />
            
            <div className="flex justify-between mb-6 text-xl font-bold text-gray-900">
              <span>Toplam</span>
              <span>{cartTotal + (neededForFreeShipping > 0 ? 49.9 : 0)} TL</span>
            </div>

            {neededForFreeShipping > 0 ? (
              <div className="mb-6 p-3 bg-red-50 text-risk-red-500 text-sm font-semibold rounded-lg text-center border border-red-100">
                Ücretsiz kargo için sepetinize {neededForFreeShipping} TL daha ekleyin.
              </div>
            ) : (
              <div className="mb-6 p-3 bg-green-50 text-badge-compatible text-sm font-bold rounded-lg text-center border border-green-100">
                Ücretsiz Kargo Kazandınız 🎉
              </div>
            )}

            <Link 
              href="/odeme"
              className="w-full py-4 bg-cta-background hover:bg-cta-hover text-white rounded-xl font-bold flex justify-center items-center transition-colors shadow-md hover:shadow-lg"
            >
              Ödemeye Geç <ArrowRight size={18} className="ml-2" />
            </Link>

            <div className="mt-4 flex items-center justify-center text-xs text-gray-500">
              <ShieldCheck size={16} className="mr-1 text-badge-certified" /> 
              <span>256-bit SSL Güvenli Ödeme</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
