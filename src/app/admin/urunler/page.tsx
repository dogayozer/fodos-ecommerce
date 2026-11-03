import { Metadata } from 'next'
import { ProductManager } from './ProductManager'

export const metadata: Metadata = {
  title: 'Ürün Yönetimi | Fodos Admin',
  robots: { index: false, follow: false },
}

export default function AdminProductsPage() {
  return (
    <div className="flex-1 p-6 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-3 mb-2">
          <h1 className="text-3xl font-extrabold text-gray-900">Ürün Yönetimi</h1>
          <a href="/admin" className="text-sm font-semibold text-trust-blue-600 hover:underline">← Admin Paneli</a>
        </div>
        <p className="text-gray-500 mb-6">Ürün adı, fiyat (Fodos / Mobil Parça Merkezi / bayi), stok, durum, kategori, açıklama ve resimleri düzenleyin. Değişiklik iki sitede de geçerlidir.</p>
        <ProductManager />
      </div>
    </div>
  )
}
