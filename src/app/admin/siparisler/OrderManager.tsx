'use client'

import { useState, useEffect } from 'react'
import { Package, Truck, CheckCircle, Clock, XCircle, Search } from 'lucide-react'

const statusMap: any = {
  pending: { label: 'Bekliyor', color: 'bg-yellow-100 text-yellow-800' },
  processing: { label: 'İşleniyor', color: 'bg-blue-100 text-blue-800' },
  shipped: { label: 'Kargolandı', color: 'bg-indigo-100 text-indigo-800' },
  delivered: { label: 'Teslim Edildi', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'İptal', color: 'bg-red-100 text-red-800' }
}

export function OrderManager() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<any>(null)

  // Edit State
  const [editStatus, setEditStatus] = useState('')
  const [editCompany, setEditCompany] = useState('')
  const [editTracking, setEditTracking] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/orders')
      const data = await res.json()
      setOrders(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleUpdate = async () => {
    if (!selectedOrder) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedOrder.id,
          status: editStatus,
          shippingCompany: editCompany,
          trackingNumber: editTracking
        })
      })
      if (res.ok) {
        await fetchOrders()
        setSelectedOrder(null)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const openEditModal = (order: any) => {
    setSelectedOrder(order)
    setEditStatus(order.status)
    setEditCompany(order.shippingCompany || '')
    setEditTracking(order.trackingNumber || '')
  }

  const filteredOrders = orders.filter(o => {
    if (activeTab === 'all') return true
    return o.status === activeTab
  })

  return (
    <div>
      {/* Tabs */}
      <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
        <button onClick={() => setActiveTab('all')} className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${activeTab === 'all' ? 'bg-trust-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border'}`}>Tümü</button>
        <button onClick={() => setActiveTab('pending')} className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${activeTab === 'pending' ? 'bg-yellow-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border'}`}>Bekleyenler</button>
        <button onClick={() => setActiveTab('processing')} className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${activeTab === 'processing' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border'}`}>İşleme Alınanlar</button>
        <button onClick={() => setActiveTab('shipped')} className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${activeTab === 'shipped' ? 'bg-indigo-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border'}`}>Kargolananlar</button>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Yükleniyor...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Bu statüde sipariş bulunamadı.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 font-semibold text-gray-600">Sipariş No / Tarih</th>
                  <th className="p-4 font-semibold text-gray-600">Müşteri</th>
                  <th className="p-4 font-semibold text-gray-600">Tutar</th>
                  <th className="p-4 font-semibold text-gray-600">Durum</th>
                  <th className="p-4 font-semibold text-gray-600">Kargo</th>
                  <th className="p-4 font-semibold text-gray-600 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div className="font-bold text-gray-900">{order.orderNumber}</div>
                      <div className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString('tr-TR')}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-gray-800">{order.customer?.name || 'Misafir'}</div>
                      <div className="text-xs text-gray-500">{order.shippingCity}, {order.shippingDistrict}</div>
                    </td>
                    <td className="p-4 font-bold text-gray-900">
                      {order.totalAmount.toLocaleString('tr-TR')} TL
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${statusMap[order.status]?.color || 'bg-gray-100 text-gray-800'}`}>
                        {statusMap[order.status]?.label || order.status}
                      </span>
                    </td>
                    <td className="p-4">
                      {order.trackingNumber ? (
                        <div className="text-xs">
                          <span className="font-semibold">{order.shippingCompany}</span><br/>
                          <span className="text-gray-500">{order.trackingNumber}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => openEditModal(order)} className="text-trust-blue-600 hover:bg-trust-blue-50 px-3 py-1 rounded font-medium text-sm">
                        Yönet
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Sipariş Yönetimi ({selectedOrder.orderNumber})</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sipariş Durumu</label>
                <select 
                  value={editStatus} 
                  onChange={e => setEditStatus(e.target.value)}
                  className="w-full border rounded-lg p-2"
                >
                  <option value="pending">Bekliyor (Yeni)</option>
                  <option value="processing">İşleme Alındı (Hazırlanıyor)</option>
                  <option value="shipped">Kargolandı</option>
                  <option value="delivered">Teslim Edildi</option>
                  <option value="cancelled">İptal Edildi</option>
                </select>
              </div>

              {(editStatus === 'shipped' || editStatus === 'delivered') && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kargo Firması</label>
                    <select 
                      value={editCompany} 
                      onChange={e => setEditCompany(e.target.value)}
                      className="w-full border rounded-lg p-2"
                    >
                      <option value="">Seçiniz...</option>
                      <option value="Yurtiçi Kargo">Yurtiçi Kargo</option>
                      <option value="Aras Kargo">Aras Kargo</option>
                      <option value="MNG Kargo">MNG Kargo</option>
                      <option value="Sürat Kargo">Sürat Kargo</option>
                      <option value="PTT Kargo">PTT Kargo</option>
                      <option value="Trendyol Express">Trendyol Express</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Takip Numarası</label>
                    <input 
                      type="text" 
                      value={editTracking} 
                      onChange={e => setEditTracking(e.target.value)}
                      className="w-full border rounded-lg p-2"
                      placeholder="Kargo takip kodu..."
                    />
                  </div>
                </>
              )}
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button 
                onClick={() => setSelectedOrder(null)} 
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                İptal
              </button>
              <button 
                onClick={handleUpdate} 
                disabled={saving}
                className="px-4 py-2 bg-trust-blue-600 text-white rounded-lg hover:bg-trust-blue-700 disabled:opacity-50"
              >
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
