import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

export default function PaymentSuccessPage() {
  return (
    <div className="flex-1 w-full flex items-center justify-center py-20 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
        <CheckCircle className="mx-auto text-green-500 mb-6" size={64} />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Siparişiniz Alındı!</h1>
        <p className="text-gray-600 mb-8">
          Ödemeniz başarıyla gerçekleşti. Sipariş detaylarınızı "Hesabım" sayfasından takip edebilir veya kargonuz yola çıktığında tarafınıza gönderilecek bilgilendirme mesajlarını bekleyebilirsiniz.
        </p>
        <div className="space-y-3">
          <Link href="/hesabim/siparislerim" className="block w-full py-3 bg-trust-blue-600 text-white rounded-xl font-bold hover:bg-trust-blue-700 transition-colors">
            Siparişlerimi Görüntüle
          </Link>
          <Link href="/" className="block w-full py-3 bg-gray-100 text-gray-800 rounded-xl font-bold hover:bg-gray-200 transition-colors">
            Alışverişe Dön
          </Link>
        </div>
      </div>
    </div>
  )
}
