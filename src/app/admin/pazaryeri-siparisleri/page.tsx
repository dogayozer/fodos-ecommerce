import { Metadata } from 'next'
import { MarketplaceOrderManager } from './MarketplaceOrderManager'
import { MarketplaceOrderNotifier } from '@/components/MarketplaceOrderNotifier'

export const metadata: Metadata = {
  title: 'Pazaryeri Siparişleri | Fodos Admin',
}

export default function MarketplaceOrdersPage() {
  return (
    <div className="flex-1 p-3 md:p-8 bg-gray-50 min-h-screen">
      <MarketplaceOrderNotifier />
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-1">Pazaryeri Siparişleri</h1>
        <p className="text-gray-500 mb-4 text-sm">
          Trendyol, Hepsiburada, N11, Çiçeksepeti — tüm hesaplardan gelen siparişler tek ekranda.
        </p>
        <MarketplaceOrderManager />
      </div>
    </div>
  )
}
