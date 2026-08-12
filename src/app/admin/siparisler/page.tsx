import { Metadata } from 'next'
import { OrderManager } from './OrderManager'

export const metadata: Metadata = {
  title: 'Sipariş Yönetimi | Fodos Admin',
}

export default function AdminOrdersPage() {
  return (
    <div className="flex-1 p-6 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Sipariş Yönetimi</h1>
        <p className="text-gray-500 mb-8">Tüm müşteri siparişlerini görüntüleyin, durumlarını güncelleyin ve kargo bilgilerini girin.</p>
        
        <OrderManager />
      </div>
    </div>
  )
}
