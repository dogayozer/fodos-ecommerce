'use client'

import { useState, useEffect } from 'react'
import { Package, Truck, CheckCircle, Clock, XCircle, Search, FileText, ExternalLink, Printer, ShieldCheck } from 'lucide-react'

const statusMap: any = {
  pending: { label: 'Ödeme Bekliyor', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  processing: { label: 'Yeni (Ödendi)', color: 'bg-green-100 text-green-800 border-green-200' },
  shipped: { label: 'Kargolandı', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  delivered: { label: 'Teslim Edildi', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  cancelled: { label: 'İptal / Ödeme Başarısız', color: 'bg-red-100 text-red-800 border-red-200' }
}

const invoiceStatusMap: any = {
  invoiced: { label: 'Faturalandı', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  pending: { label: 'Fatura Bekliyor', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  cancelled: { label: 'İptal Edildi', color: 'bg-gray-100 text-gray-600 border-gray-200' },
  failed: { label: 'Fatura Reddedildi', color: 'bg-red-100 text-red-800 border-red-300' }
}

export function OrderManager() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<any>(null)

  // Edit State
  const [editStatus, setEditStatus] = useState('')
  const [editCompany, setEditCompany] = useState('')
  const [editTracking, setEditTracking] = useState('')
  const [editAdminNote, setEditAdminNote] = useState('')
  const [editInvoiceStatus, setEditInvoiceStatus] = useState('pending')
  const [editInvoiceNumber, setEditInvoiceNumber] = useState('')
  const [editInvoiceUrl, setEditInvoiceUrl] = useState('')
  const [editTaxNumber, setEditTaxNumber] = useState('')
  const [editTaxOffice, setEditTaxOffice] = useState('')
  const [editCompanyTitle, setEditCompanyTitle] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/orders')
      const data = await res.json()
      setOrders(Array.isArray(data) ? data : [])
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
          trackingNumber: editTracking,
          adminNote: editAdminNote,
          invoiceStatus: editInvoiceStatus,
          invoiceNumber: editInvoiceNumber,
          invoiceUrl: editInvoiceUrl,
          taxNumber: editTaxNumber,
          taxOffice: editTaxOffice,
          companyTitle: editCompanyTitle
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
    setEditAdminNote(order.adminNote || '')
    setEditInvoiceStatus(order.invoiceStatus || 'pending')
    setEditInvoiceNumber(order.invoiceNumber || '')
    setEditInvoiceUrl(order.invoiceUrl || '')
    setEditTaxNumber(order.taxNumber || '')
    setEditTaxOffice(order.taxOffice || '')
    setEditCompanyTitle(order.companyTitle || '')
  }

  const handlePrint = (order: any) => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const itemsHtml = order.items?.map((item: any) => `
      <tr style="border-bottom: 1px solid #ddd;">
        <td style="padding: 12px 8px;">${item.product?.title || 'Ürün'}</td>
        <td style="padding: 12px 8px; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px 8px; text-align: right;">${item.price.toLocaleString('tr-TR')} TL</td>
        <td style="padding: 12px 8px; text-align: right;">${(item.quantity * item.price).toLocaleString('tr-TR')} TL</td>
      </tr>
    `).join('') || ''

    const html = `
      <html>
        <head>
          <title>Sipariş Fişi - ${order.orderNumber}</title>
          <style>
            body { font-family: sans-serif; color: #333; margin: 40px; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .info-block { margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { text-align: left; padding: 12px 8px; background-color: #f9fafb; border-bottom: 2px solid #ddd; }
            .totals { width: 100%; display: flex; justify-content: flex-end; }
            .totals table { width: 300px; }
            .note { padding: 15px; background: #f9fafb; border-radius: 8px; margin-top: 30px; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 style="margin:0;">FODOS & PİAKS</h1>
              <p style="margin:5px 0 0 0; color:#666;">Sipariş Fişi</p>
            </div>
            <div style="text-align: right;">
              <h2 style="margin:0;">#${order.orderNumber}</h2>
              <p style="margin:5px 0 0 0; color:#666;">Tarih: ${new Date(order.createdAt).toLocaleDateString('tr-TR')}</p>
            </div>
          </div>
          
          <div style="display: flex; justify-content: space-between;" class="info-block">
            <div style="width: 48%;">
              <h3 style="margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Müşteri Bilgileri</h3>
              <p style="margin: 4px 0;"><strong>${order.customer?.name || 'Misafir'}</strong></p>
              <p style="margin: 4px 0;">${order.customer?.phone || ''}</p>
              <p style="margin: 4px 0;">${order.customer?.email || ''}</p>
              ${order.taxNumber ? `<p style="margin: 4px 0; color: #555;">TC/Vergi No: ${order.taxNumber}</p>` : ''}
              ${order.companyTitle ? `<p style="margin: 4px 0; color: #555;">Unvan: ${order.companyTitle}</p>` : ''}
            </div>
            <div style="width: 48%;">
              <h3 style="margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Teslimat Adresi</h3>
              <p style="margin: 4px 0;">${order.shippingAddress || ''}</p>
              <p style="margin: 4px 0;">${order.shippingDistrict || ''} / ${order.shippingCity || ''}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Ürün</th>
                <th style="text-align: center;">Adet</th>
                <th style="text-align: right;">Birim Fiyat</th>
                <th style="text-align: right;">Toplam</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="totals">
            <table>
              <tr>
                <td style="padding: 8px;">Ara Toplam:</td>
                <td style="padding: 8px; text-align: right;">${(order.totalAmount - (order.shippingCost || 0)).toLocaleString('tr-TR')} TL</td>
              </tr>
              <tr>
                <td style="padding: 8px;">Kargo Ücreti:</td>
                <td style="padding: 8px; text-align: right;">${(order.shippingCost || 0).toLocaleString('tr-TR')} TL</td>
              </tr>
              <tr style="font-weight: bold; font-size: 18px;">
                <td style="padding: 8px; border-top: 2px solid #333;">Genel Toplam:</td>
                <td style="padding: 8px; text-align: right; border-top: 2px solid #333;">${order.totalAmount.toLocaleString('tr-TR')} TL</td>
              </tr>
            </table>
          </div>

          ${order.invoiceNumber ? `<div class="note"><strong>BirFatura E-Fatura No:</strong> ${order.invoiceNumber}</div>` : ''}
          ${order.adminNote ? `<div class="note"><strong>Yönetici Notu:</strong><br/>${order.adminNote.replace(/\n/g, '<br/>')}</div>` : ''}
          
          <script>
            window.onload = () => {
              window.print();
            }
          </script>
        </body>
      </html>
    `
    printWindow.document.write(html)
    printWindow.document.close()
  }

  // Filtering
  const filteredOrders = orders.filter(o => {
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      const matchOrderNum = o.orderNumber?.toLowerCase().includes(q)
      const matchName = o.customer?.name?.toLowerCase().includes(q)
      const matchPhone = o.customer?.phone?.toLowerCase().includes(q)
      const matchEmail = o.customer?.email?.toLowerCase().includes(q)
      const matchInvoice = o.invoiceNumber?.toLowerCase().includes(q)
      const matchTracking = o.trackingNumber?.toLowerCase().includes(q)
      if (!matchOrderNum && !matchName && !matchPhone && !matchEmail && !matchInvoice && !matchTracking) {
        return false
      }
    }

    // Tab filter
    if (activeTab === 'all') return true
    if (activeTab === 'pending_invoice') return o.invoiceStatus === 'pending' || !o.invoiceStatus
    if (activeTab === 'invoiced') return o.invoiceStatus === 'invoiced'
    return o.status === activeTab
  })

  const uninvoicedCount = orders.filter(o => o.invoiceStatus === 'pending' || !o.invoiceStatus).length
  const invoicedCount = orders.filter(o => o.invoiceStatus === 'invoiced').length

  return (
    <div>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Toplam Sipariş</p>
            <p className="text-2xl font-black text-gray-900">{orders.length}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-amber-700 uppercase">Fatura Bekleyen</p>
            <p className="text-2xl font-black text-amber-800">{uninvoicedCount}</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-emerald-700 uppercase">Faturalanan Sipariş</p>
            <p className="text-2xl font-black text-emerald-800">{invoicedCount}</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-indigo-700 uppercase">Kargodaki Sipariş</p>
            <p className="text-2xl font-black text-indigo-800">{orders.filter(o => o.status === 'shipped').length}</p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <Truck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Search & Tabs */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center mb-6">
        <div className="flex space-x-2 overflow-x-auto pb-2 md:pb-0">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-2 rounded-lg font-medium text-xs whitespace-nowrap transition-colors ${activeTab === 'all' ? 'bg-trust-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border'}`}
          >
            Tümü ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('pending_invoice')}
            className={`px-3 py-2 rounded-lg font-medium text-xs whitespace-nowrap transition-colors flex items-center gap-1.5 ${activeTab === 'pending_invoice' ? 'bg-amber-600 text-white ring-2 ring-amber-400' : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'}`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            Fatura Bekleyen ({uninvoicedCount})
          </button>
          <button
            onClick={() => setActiveTab('invoiced')}
            className={`px-3 py-2 rounded-lg font-medium text-xs whitespace-nowrap transition-colors flex items-center gap-1.5 ${activeTab === 'invoiced' ? 'bg-emerald-600 text-white ring-2 ring-emerald-400' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'}`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Faturalananlar ({invoicedCount})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3 py-2 rounded-lg font-medium text-xs whitespace-nowrap transition-colors ${activeTab === 'pending' ? 'bg-yellow-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border'}`}
          >
            Bekleyenler
          </button>
          <button
            onClick={() => setActiveTab('shipped')}
            className={`px-3 py-2 rounded-lg font-medium text-xs whitespace-nowrap transition-colors ${activeTab === 'shipped' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border'}`}
          >
            Kargolananlar
          </button>
        </div>

        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Sipariş no, müşteri, fatura no ara..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-trust-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Yükleniyor...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Aramanıza uygun sipariş bulunamadı.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b text-gray-600 text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-4 font-semibold">Sipariş No / Tarih</th>
                  <th className="p-4 font-semibold">Müşteri</th>
                  <th className="p-4 font-semibold">Tutar</th>
                  <th className="p-4 font-semibold">Sipariş Durumu</th>
                  <th className="p-4 font-semibold">Fatura (BirFatura)</th>
                  <th className="p-4 font-semibold">Kargo</th>
                  <th className="p-4 font-semibold text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map(order => {
                  const isInvoiced = order.invoiceStatus === 'invoiced'
                  return (
                    <tr key={order.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-gray-900 font-mono">{order.orderNumber}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' })}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-gray-800">{order.customer?.name || 'Misafir'}</div>
                        <div className="text-xs text-gray-500">{order.shippingCity}, {order.shippingDistrict}</div>
                        {order.customer?.phone && (
                          <div className="text-xs text-gray-400">{order.customer.phone}</div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-gray-900">
                          {order.totalAmount.toLocaleString('tr-TR')} TL
                        </div>
                        {order.discountApplied > 0 && (
                          <div className="text-xs text-green-600">-{order.discountApplied.toLocaleString('tr-TR')} TL indirim</div>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${statusMap[order.status]?.color || 'bg-gray-100 text-gray-800'}`}>
                          {statusMap[order.status]?.label || order.status}
                        </span>
                      </td>
                      <td className="p-4">
                        {isInvoiced ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              Faturalandı
                            </span>
                            {order.invoiceNumber && (
                              <div className="text-xs font-mono text-gray-600 flex items-center gap-1">
                                <span>{order.invoiceNumber}</span>
                              </div>
                            )}
                            {order.invoiceUrl && (
                              <a
                                href={order.invoiceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold underline"
                              >
                                <FileText className="w-3.5 h-3.5" /> PDF Fatura
                              </a>
                            )}
                          </div>
                        ) : order.invoiceStatus === 'failed' ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                              Fatura Reddedildi
                            </span>
                            {order.invoiceFailReason && (
                              <div className="text-[10px] text-red-600 font-semibold leading-tight" title={order.invoiceFailReason}>
                                {order.invoiceFailReason.length > 40 ? order.invoiceFailReason.substring(0, 40) + '...' : order.invoiceFailReason}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                            Fatura Bekliyor
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        {order.trackingNumber ? (
                          <div className="text-xs">
                            <span className="font-semibold text-gray-800">{order.shippingCompany}</span><br />
                            <span className="font-mono text-gray-500">{order.trackingNumber}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {order.invoiceUrl && (
                            <a
                              href={order.invoiceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Faturayı Görüntüle"
                              className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            >
                              <FileText className="w-4 h-4" />
                            </a>
                          )}
                          <button
                            onClick={() => handlePrint(order)}
                            title="Sipariş Fişi Yazdır"
                            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(order)}
                            className="bg-trust-blue-50 text-trust-blue-600 hover:bg-trust-blue-100 px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors"
                          >
                            Yönet
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit / Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-4 mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Sipariş Yönetimi & BirFatura</h3>
                <p className="text-xs text-gray-500 font-mono">#{selectedOrder.orderNumber} • {new Date(selectedOrder.createdAt).toLocaleString('tr-TR')}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600 p-2 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-5">
              {/* BirFatura ve Fatura Bilgileri Kartı */}
              <div className="bg-gradient-to-br from-indigo-50/60 to-purple-50/40 p-4 rounded-xl border border-indigo-100">
                <div className="flex items-center justify-between mb-3 border-b border-indigo-100/80 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🧾</span>
                    <h4 className="text-sm font-bold text-indigo-900">BirFatura & E-Fatura Durumu</h4>
                  </div>
                  {editInvoiceUrl && (
                    <a
                      href={editInvoiceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1 rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> PDF Faturayı Aç
                    </a>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Fatura Durumu</label>
                    <select
                      value={editInvoiceStatus}
                      onChange={e => setEditInvoiceStatus(e.target.value)}
                      className="w-full border border-indigo-200 bg-white rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="pending">Fatura Bekliyor (Henüz Kesilmedi)</option>
                      <option value="invoiced">Faturalandı (E-Arşiv/E-Fatura Kesildi)</option>
                      <option value="cancelled">Fatura İptal Edildi</option>
                      <option value="failed">Fatura Reddedildi (Hatalı)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Fatura Numarası</label>
                    <input
                      type="text"
                      value={editInvoiceNumber}
                      onChange={e => setEditInvoiceNumber(e.target.value)}
                      className="w-full border border-indigo-200 bg-white rounded-lg p-2 text-sm font-mono focus:ring-2 focus:ring-indigo-500"
                      placeholder="Örn: GIB202600000123"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Fatura PDF / Görüntüleme Linki</label>
                    <input
                      type="text"
                      value={editInvoiceUrl}
                      onChange={e => setEditInvoiceUrl(e.target.value)}
                      className="w-full border border-indigo-200 bg-white rounded-lg p-2 text-xs font-mono focus:ring-2 focus:ring-indigo-500"
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">TC Kimlik / Vergi No</label>
                    <input
                      type="text"
                      value={editTaxNumber}
                      onChange={e => setEditTaxNumber(e.target.value)}
                      className="w-full border border-indigo-200 bg-white rounded-lg p-2 text-xs font-mono focus:ring-2 focus:ring-indigo-500"
                      placeholder="Bireysel için TCKN, Kurumsal için VKN"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Vergi Dairesi / Şirket Unvanı</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editTaxOffice}
                        onChange={e => setEditTaxOffice(e.target.value)}
                        className="w-1/2 border border-indigo-200 bg-white rounded-lg p-2 text-xs focus:ring-2 focus:ring-indigo-500"
                        placeholder="Vergi Dairesi"
                      />
                      <input
                        type="text"
                        value={editCompanyTitle}
                        onChange={e => setEditCompanyTitle(e.target.value)}
                        className="w-1/2 border border-indigo-200 bg-white rounded-lg p-2 text-xs focus:ring-2 focus:ring-indigo-500"
                        placeholder="Şirket Unvanı"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Sipariş ve Kargo Bilgileri */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Sipariş Durumu</label>
                  <select
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value)}
                    className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-trust-blue-500"
                  >
                    <option value="pending">Ödeme Bekliyor</option>
                    <option value="processing">Yeni (Ödendi)</option>
                    <option value="shipped">Kargolandı</option>
                    <option value="delivered">Teslim Edildi</option>
                    <option value="cancelled">İptal / Ödeme Başarısız</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Kargo Firması</label>
                  <select
                    value={editCompany}
                    onChange={e => setEditCompany(e.target.value)}
                    className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-trust-blue-500"
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

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Kargo Takip Numarası</label>
                  <input
                    type="text"
                    value={editTracking}
                    onChange={e => setEditTracking(e.target.value)}
                    className="w-full border rounded-lg p-2 text-sm font-mono focus:ring-2 focus:ring-trust-blue-500"
                    placeholder="Kargo takip kodu..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Admin Notu (Müşteri Görmez)</label>
                <textarea
                  value={editAdminNote}
                  onChange={e => setEditAdminNote(e.target.value)}
                  className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-trust-blue-500"
                  rows={2}
                  placeholder="Siparişle ilgili özel notlar..."
                />
              </div>

              {/* Sipariş İçeriği */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Sipariş İçeriği & Kalemler</label>
                <div className="bg-gray-50 border rounded-lg p-3 space-y-2 max-h-40 overflow-y-auto">
                  {selectedOrder.items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center text-xs bg-white p-2 border rounded">
                      <div className="flex-1 truncate mr-2">
                        <p className="font-semibold text-gray-800">{item.product?.title || 'Ürün'}</p>
                        <p className="text-gray-400 font-mono">Barkod: {item.product?.barcode || '-'}</p>
                      </div>
                      <div className="text-gray-500 w-16 text-center">{item.quantity} Adet</div>
                      <div className="font-bold text-right w-24">{(item.price * item.quantity).toLocaleString('tr-TR')} TL</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-between items-center border-t pt-4">
              <button
                onClick={() => handlePrint(selectedOrder)}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 text-xs font-bold flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Fiş Yazdır
              </button>
              <div className="flex space-x-3">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-xs font-semibold"
                >
                  Kapat
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={saving}
                  className="px-5 py-2 bg-trust-blue-600 text-white rounded-lg hover:bg-trust-blue-700 disabled:opacity-50 text-xs font-bold"
                >
                  {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
