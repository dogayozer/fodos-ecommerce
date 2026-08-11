'use client'

import { useState, useEffect } from 'react'

export function CouponManager() {
  const [coupons, setCoupons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    value: ''
  })

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    try {
      const res = await fetch('/api/admin/coupons')
      const data = await res.json()
      if (res.ok) {
        setCoupons(data.coupons)
      } else {
        throw new Error(data.error)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: formData.code,
          type: formData.type,
          value: parseFloat(formData.value)
        })
      })
      const data = await res.json()
      if (res.ok) {
        setFormData({ code: '', type: 'percentage', value: '' })
        fetchCoupons()
      } else {
        alert(data.error)
      }
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !currentStatus })
      })
      if (res.ok) {
        fetchCoupons()
      }
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bu kuponu silmek istediğinize emin misiniz?')) return
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      if (res.ok) {
        fetchCoupons()
      }
    } catch (err: any) {
      alert(err.message)
    }
  }

  if (loading) return <div className="p-6">Yükleniyor...</div>

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-2">Kupon Yönetimi</h2>
      
      <form onSubmit={handleCreate} className="flex gap-4 mb-8 bg-gray-50 p-4 rounded-lg">
        <div className="flex-1">
          <input type="text" required placeholder="Kupon Kodu (Örn: YAZ10)" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-trust-blue-500" />
        </div>
        <div className="w-40">
          <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-trust-blue-500">
            <option value="percentage">Yüzde (%)</option>
            <option value="fixed">Sabit Tutar (TL)</option>
          </select>
        </div>
        <div className="w-32">
          <input type="number" required placeholder="Değer" value={formData.value} onChange={e => setFormData({...formData, value: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-trust-blue-500" />
        </div>
        <button type="submit" className="bg-trust-blue-600 hover:bg-trust-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
          Oluştur
        </button>
      </form>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-3 rounded-tl-lg">Kupon Kodu</th>
              <th className="px-4 py-3">Tip</th>
              <th className="px-4 py-3">Değer</th>
              <th className="px-4 py-3">Durum</th>
              <th className="px-4 py-3 rounded-tr-lg text-right">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3 font-semibold text-gray-900">{c.code}</td>
                <td className="px-4 py-3">{c.type === 'percentage' ? 'Yüzde (%)' : 'Sabit Tutar'}</td>
                <td className="px-4 py-3">{c.type === 'percentage' ? `%${c.value}` : `${c.value} TL`}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {c.isActive ? 'Aktif' : 'Pasif'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button onClick={() => handleToggle(c.id, c.isActive)} className="text-trust-blue-600 hover:underline">
                    {c.isActive ? 'Pasife Al' : 'Aktifleştir'}
                  </button>
                  <span className="text-gray-300">|</span>
                  <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:underline">Sil</button>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">Kayıtlı kupon bulunmamaktadır.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
