'use client'

import { useState, useEffect } from 'react'

export function SettingsForm() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  
  const [formData, setFormData] = useState({
    companyName: '',
    address: '',
    phone: '',
    aboutUs: '',
    mesafeliSatisHtml: '',
    gizlilikGuvenlikHtml: '',
    iptalIadeHtml: '',
    kargoTakipHtml: '',
    kisiselVerilerHtml: '',
    shippingThreshold: 500,
    shippingFee: 110,
    sameDayShippingTime: '16:00'
  })

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        if (data.settings) {
          setFormData({
            companyName: data.settings.companyName || '',
            address: data.settings.address || '',
            phone: data.settings.phone || '',
            aboutUs: data.settings.aboutUs || '',
            mesafeliSatisHtml: data.settings.mesafeliSatisHtml || '',
            gizlilikGuvenlikHtml: data.settings.gizlilikGuvenlikHtml || '',
            iptalIadeHtml: data.settings.iptalIadeHtml || '',
            kargoTakipHtml: data.settings.kargoTakipHtml || '',
            kisiselVerilerHtml: data.settings.kisiselVerilerHtml || '',
            shippingThreshold: data.settings.shippingThreshold || 0,
            shippingFee: data.settings.shippingFee || 0,
            sameDayShippingTime: data.settings.sameDayShippingTime || '16:00'
          })
        }
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (!res.ok) throw new Error('Kaydetme hatası')
      setMessage('Ayarlar başarıyla kaydedildi!')
      setTimeout(() => setMessage(''), 3000)
    } catch (err: any) {
      setMessage(err.message || 'Bir hata oluştu.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Yükleniyor...</div>

  return (
    <form onSubmit={handleSubmit} className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-trust-blue-600 mb-6">Firma Bilgileri & Sözleşmeler</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Firma Adı (Footer İçin)</label>
          <input name="companyName" value={formData.companyName} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-trust-blue-500" placeholder="Örn: Fodos ve Piaks" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Telefon Numarası</label>
          <input name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-trust-blue-500" placeholder="Örn: 0532 232 44 99" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Firma Adresi</label>
          <input name="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-trust-blue-500" placeholder="Açık Adres" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Hakkımızda (Kısa Tanıtım)</label>
          <textarea name="aboutUs" value={formData.aboutUs} onChange={handleChange} rows={4} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-trust-blue-500" placeholder="Hakkımızda sayfasına yazılacak metin..." />
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Kargo Ayarları</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sabit Kargo Ücreti (TL)</label>
          <input type="number" name="shippingFee" value={formData.shippingFee} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-trust-blue-500" placeholder="Örn: 110" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ücretsiz Kargo Baremi (TL)</label>
          <input type="number" name="shippingThreshold" value={formData.shippingThreshold} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-trust-blue-500" placeholder="Örn: 500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Aynı Gün Kargo Saati</label>
          <input type="time" name="sameDayShippingTime" value={formData.sameDayShippingTime} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-trust-blue-500" />
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Yasal Sözleşmeler ve Belgeler</h3>
      <p className="text-sm text-gray-500 mb-6">Aşağıdaki alanlara sözleşme metinlerinizi yapıştırabilirsiniz. Doldurduğunuz belgelerin linkleri otomatik olarak sitenin en altında (footer) görünecektir.</p>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mesafeli Satış Sözleşmesi</label>
          <textarea name="mesafeliSatisHtml" value={formData.mesafeliSatisHtml} onChange={handleChange} rows={6} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-trust-blue-500" placeholder="Sözleşme metnini buraya yapıştırın..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gizlilik ve Güvenlik Politikası</label>
          <textarea name="gizlilikGuvenlikHtml" value={formData.gizlilikGuvenlikHtml} onChange={handleChange} rows={6} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-trust-blue-500" placeholder="Politika metnini buraya yapıştırın..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">İptal ve İade Koşulları</label>
          <textarea name="iptalIadeHtml" value={formData.iptalIadeHtml} onChange={handleChange} rows={6} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-trust-blue-500" placeholder="İade koşullarını buraya yapıştırın..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kargo Takibi ve Süreçleri</label>
          <textarea name="kargoTakipHtml" value={formData.kargoTakipHtml} onChange={handleChange} rows={6} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-trust-blue-500" placeholder="Kargo bilgilendirmesini buraya yapıştırın..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kişisel Veriler Politikası (KVKK)</label>
          <textarea name="kisiselVerilerHtml" value={formData.kisiselVerilerHtml} onChange={handleChange} rows={6} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-trust-blue-500" placeholder="KVKK metnini buraya yapıştırın..." />
        </div>
      </div>

      <div className="mt-8 flex items-center gap-4">
        <button type="submit" disabled={saving} className="px-6 py-3 bg-trust-blue-600 text-white font-medium rounded-lg hover:bg-trust-blue-700 transition-colors disabled:opacity-50">
          {saving ? 'Kaydediliyor...' : 'Tüm Bilgileri Kaydet'}
        </button>
        {message && <span className="text-sm font-medium text-green-600 bg-green-50 px-4 py-2 rounded-lg">{message}</span>}
      </div>
    </form>
  )
}
