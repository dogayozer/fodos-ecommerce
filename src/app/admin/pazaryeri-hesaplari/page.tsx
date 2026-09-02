import { Metadata } from 'next'
import { MarketplaceAccountManager } from './MarketplaceAccountManager'

export const metadata: Metadata = {
  title: 'Pazaryeri Hesapları | Fodos Admin',
}

export default function MarketplaceAccountsPage() {
  return (
    <div className="flex-1 p-3 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-1">Pazaryeri Hesapları</h1>
        <p className="text-gray-500 mb-6 text-sm">
          Trendyol/Hepsiburada/N11/Çiçeksepeti satıcı hesaplarının API bilgilerini buradan ekle/düzenle.
        </p>
        <MarketplaceAccountManager />
      </div>
    </div>
  )
}
