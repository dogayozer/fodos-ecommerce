import { Metadata } from 'next'
import { OrderManager } from './OrderManager'
import { OrderNotifier } from '@/components/OrderNotifier'
import { AdminPushToggle } from '@/components/AdminPushToggle'

export const metadata: Metadata = {
  title: 'Sipariş Yönetimi | Fodos Admin',
  manifest: '/admin-manifest.webmanifest',
}

export default function AdminOrdersPage() {
  return (
    <div className="flex-1 p-6 md:p-8 bg-gray-50 min-h-screen">
      <OrderNotifier />
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
          <h1 className="text-3xl font-extrabold text-gray-900">Sipariş Yönetimi</h1>
          <AdminPushToggle />
        </div>
        <p className="text-gray-500 mb-8">Tüm müşteri siparişlerini görüntüleyin, durumlarını güncelleyin ve kargo bilgilerini girin.</p>
        
        <OrderManager />
      </div>
    </div>
  )
}
