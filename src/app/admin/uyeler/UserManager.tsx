'use client'

import { useState, useEffect } from 'react'
import { Search, User, Mail, Phone, MapPin, ShoppingBag } from 'lucide-react'

export function UserManager() {
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/customers')
      const data = await res.json()
      setCustomers(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const filteredCustomers = customers.filter(c => {
    const s = search.toLowerCase()
    return (
      (c.name && c.name.toLowerCase().includes(s)) ||
      (c.email && c.email.toLowerCase().includes(s)) ||
      (c.phone && c.phone.includes(s))
    )
  })

  return (
    <div>
      <div className="mb-6 flex space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="İsim, e-posta veya telefon ara..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Yükleniyor...</div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Kayıtlı üye bulunamadı.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 font-semibold text-gray-600">Müşteri</th>
                  <th className="p-4 font-semibold text-gray-600">İletişim</th>
                  <th className="p-4 font-semibold text-gray-600">Bölge</th>
                  <th className="p-4 font-semibold text-gray-600">Siparişler</th>
                  <th className="p-4 font-semibold text-gray-600 text-right">Detay</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map(customer => (
                  <tr key={customer.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div className="font-bold text-gray-900 flex items-center space-x-2">
                        <User size={16} className="text-gray-400" />
                        <span>{customer.name || 'İsimsiz / Misafir'}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Kayıt: {new Date(customer.createdAt).toLocaleDateString('tr-TR')}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2 text-gray-600 mb-1">
                        <Mail size={14} />
                        <span>{customer.email}</span>
                      </div>
                      {customer.phone && (
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Phone size={14} />
                          <span>{customer.phone}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-gray-600">
                      {customer.city ? `${customer.district}, ${customer.city}` : '-'}
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-trust-blue-600 bg-trust-blue-50 px-2 py-1 rounded inline-block">
                        {customer.orders?.length || 0} Sipariş
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => setSelectedCustomer(customer)}
                        className="text-trust-blue-600 hover:bg-trust-blue-50 px-3 py-1 rounded font-medium text-sm border border-transparent hover:border-trust-blue-200 transition-colors"
                      >
                        Geçmişi Gör
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Müşteri Detay Modali */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="p-6 border-b flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">{selectedCustomer.name || 'İsimsiz Müşteri'}</h3>
                <p className="text-sm text-gray-500">{selectedCustomer.email}</p>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="p-2 hover:bg-gray-100 rounded-full">
                ✕
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><MapPin size={18}/> Teslimat Bilgileri</h4>
                  <p className="text-sm text-gray-600 mb-1"><strong>Telefon:</strong> {selectedCustomer.phone || '-'}</p>
                  <p className="text-sm text-gray-600 mb-1"><strong>İl/İlçe:</strong> {selectedCustomer.city ? `${selectedCustomer.city} / ${selectedCustomer.district}` : '-'}</p>
                  <p className="text-sm text-gray-600"><strong>Adres:</strong> {selectedCustomer.address || '-'}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><ShoppingBag size={18}/> İstatistikler</h4>
                  <p className="text-sm text-gray-600 mb-1"><strong>Toplam Sipariş:</strong> {selectedCustomer.orders?.length || 0}</p>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Toplam Harcama:</strong> {selectedCustomer.orders?.reduce((sum: number, o: any) => sum + o.totalAmount, 0).toLocaleString('tr-TR')} TL
                  </p>
                  <p className="text-sm text-gray-600"><strong>Üyelik Tipi:</strong> {selectedCustomer.isGuest ? 'Misafir' : 'Kayıtlı Üye'}</p>
                </div>
              </div>

              <h4 className="font-bold text-lg text-gray-900 mb-4">Sipariş Geçmişi</h4>
              
              {selectedCustomer.orders?.length > 0 ? (
                <div className="space-y-4">
                  {selectedCustomer.orders.map((order: any) => (
                    <div key={order.id} className="bg-white border rounded-lg p-4 shadow-sm">
                      <div className="flex justify-between items-center mb-3 border-b pb-2">
                        <div>
                          <span className="font-bold text-gray-800">#{order.orderNumber}</span>
                          <span className="text-xs text-gray-500 ml-2">{new Date(order.createdAt).toLocaleString('tr-TR')}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-xs font-bold px-2 py-1 rounded bg-gray-100">{order.status}</span>
                          <span className="font-bold text-trust-blue-600">{order.totalAmount.toLocaleString('tr-TR')} TL</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {order.items.map((item: any) => (
                          <div key={item.id} className="flex justify-between text-sm text-gray-600">
                            <span className="truncate flex-1 pr-4">{item.product?.title || 'Ürün'}</span>
                            <span className="w-16 text-center">{item.quantity} Adet</span>
                            <span className="w-24 text-right">{(item.price * item.quantity).toLocaleString('tr-TR')} TL</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Henüz sipariş kaydı bulunmuyor.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
