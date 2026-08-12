import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { jwtVerify } from 'jose'
import Image from 'next/image'
import Link from 'next/link'
import { ExternalLink, Truck, CheckCircle, Clock, XCircle, Package } from 'lucide-react'

export const dynamic = 'force-dynamic'

const statusMap: any = {
  pending: { label: 'Onay Bekliyor', icon: <Clock size={16} className="text-yellow-600"/>, color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  processing: { label: 'Hazırlanıyor', icon: <Package size={16} className="text-blue-600"/>, color: 'bg-blue-50 text-blue-700 border-blue-200' },
  shipped: { label: 'Kargoya Verildi', icon: <Truck size={16} className="text-indigo-600"/>, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  delivered: { label: 'Teslim Edildi', icon: <CheckCircle size={16} className="text-green-600"/>, color: 'bg-green-50 text-green-700 border-green-200' },
  cancelled: { label: 'İptal Edildi', icon: <XCircle size={16} className="text-red-600"/>, color: 'bg-red-50 text-red-700 border-red-200' }
}

export default async function SiparislerimPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value
  
  if (!token) return null

  let orders: any[] = []
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret')
    const { payload } = await jwtVerify(token, secret)
    orders = await prisma.order.findMany({
      where: { customerId: payload.userId as string },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: {
              include: { images: true }
            }
          }
        }
      }
    })
  } catch (e) {
    return <div>Oturum hatası.</div>
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">Geçmiş Siparişlerim</h1>
      
      {orders.length === 0 ? (
        <div className="text-center py-12">
          <Package size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Henüz siparişiniz bulunmuyor</h3>
          <p className="text-gray-500 mt-2 mb-6">Fodos'un kaliteli ürünlerini keşfetmeye hemen başlayın.</p>
          <Link href="/" className="bg-trust-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-trust-blue-700">
            Alışverişe Başla
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => {
            const status = statusMap[order.status] || statusMap['pending']
            
            return (
              <div key={order.id} className="border border-gray-200 rounded-xl overflow-hidden">
                {/* Order Header */}
                <div className="bg-gray-50 p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-6 text-sm">
                    <div>
                      <span className="block text-gray-500">Sipariş Tarihi</span>
                      <span className="font-semibold">{new Date(order.createdAt).toLocaleDateString('tr-TR')}</span>
                    </div>
                    <div>
                      <span className="block text-gray-500">Sipariş Özeti</span>
                      <span className="font-semibold">{order.items.length} Ürün</span>
                    </div>
                    <div>
                      <span className="block text-gray-500">Toplam Tutar</span>
                      <span className="font-semibold text-trust-blue-700">{order.totalAmount.toLocaleString('tr-TR')} TL</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-gray-500 text-sm">Sipariş No</span>
                    <span className="font-bold text-gray-900">#{order.orderNumber}</span>
                  </div>
                </div>

                {/* Order Status & Cargo */}
                <div className="p-4 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${status.color}`}>
                    {status.icon}
                    <span className="font-bold text-sm">{status.label}</span>
                  </div>

                  {order.trackingNumber && (
                    <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                      <div>
                        <span className="block text-xs text-gray-500">Kargo Firması: <strong className="text-gray-900">{order.shippingCompany}</strong></span>
                        <span className="block text-sm font-bold text-gray-900">Takip No: {order.trackingNumber}</span>
                      </div>
                      <a 
                        href={`https://www.google.com/search?q=${order.shippingCompany}+kargo+takip+${order.trackingNumber}`}
                        target="_blank" 
                        className="p-2 bg-white rounded-md border shadow-sm text-trust-blue-600 hover:bg-trust-blue-50"
                        title="Kargoyu Takip Et"
                      >
                        <ExternalLink size={18} />
                      </a>
                    </div>
                  )}
                </div>

                {/* Order Items */}
                <div className="p-4 border-t border-gray-100 divide-y">
                  {order.items.map((item: any) => (
                    <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-center gap-4">
                      <div className="w-16 h-16 bg-gray-50 rounded-lg relative overflow-hidden flex-shrink-0 border border-gray-100">
                        {item.product?.images?.[0]?.url ? (
                          <Image src={item.product.images[0].url} alt="" fill className="object-contain mix-blend-multiply" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">Resim</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link href={`/urun/${item.product?.slug}`} className="text-sm font-semibold text-gray-900 hover:text-trust-blue-600 line-clamp-2">
                          {item.product?.title || 'Bilinmeyen Ürün'}
                        </Link>
                        <div className="text-sm text-gray-500 mt-1">
                          Adet: {item.quantity} x {item.price.toLocaleString('tr-TR')} TL
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
