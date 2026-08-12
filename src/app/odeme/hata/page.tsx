import Link from 'next/link'
import { XCircle } from 'lucide-react'

export default function PaymentFailPage() {
  return (
    <div className="flex-1 w-full flex items-center justify-center py-20 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
        <XCircle className="mx-auto text-red-500 mb-6" size={64} />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Ödeme Başarısız</h1>
        <p className="text-gray-600 mb-8">
          Kredi kartı işleminiz onaylanmadı. Lütfen kart bilgilerinizi, bakiyenizi veya internet alışverişi yetkinizi kontrol edip tekrar deneyin.
        </p>
        <div className="space-y-3">
          <Link href="/sepet" className="block w-full py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors">
            Sepete Dön ve Tekrar Dene
          </Link>
          <Link href="/" className="block w-full py-3 bg-gray-100 text-gray-800 rounded-xl font-bold hover:bg-gray-200 transition-colors">
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </div>
  )
}
