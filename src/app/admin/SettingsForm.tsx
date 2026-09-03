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
    sameDayShippingTime: '16:00',
    birfaturaApiKey: '',
    birfaturaKdvRate: 20,
    birfaturaAutoSync: true
  })
  const [copiedField, setCopiedField] = useState<string | null>(null)

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
            sameDayShippingTime: data.settings.sameDayShippingTime || '16:00',
            birfaturaApiKey: data.settings.birfaturaApiKey || 'bf_fodos_' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36),
            birfaturaKdvRate: data.settings.birfaturaKdvRate ?? 20,
            birfaturaAutoSync: data.settings.birfaturaAutoSync ?? true
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

  if (loading) return <div className="p-8 text-center text-neutral-500">Yükleniyor...</div>

  return (
    <form onSubmit={handleSubmit} className="mt-8 bg-neutral-0 rounded-xl shadow-[var(--shadow-card)] border border-neutral-200 p-6">
      <h2 className="text-xl font-bold text-trust-blue-600 mb-6">Firma Bilgileri & Sözleşmeler</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-sm font-medium text-neutral-900 mb-1">Firma Adı (Footer İçin)</label>
          <input name="companyName" value={formData.companyName} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-trust-blue-500" placeholder="Örn: Fodos ve Piaks" />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-900 mb-1">Telefon Numarası</label>
          <input name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-trust-blue-500" placeholder="Örn: 0532 232 44 99" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-neutral-900 mb-1">Firma Adresi</label>
          <input name="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-trust-blue-500" placeholder="Açık Adres" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-neutral-900 mb-1">Hakkımızda (Kısa Tanıtım)</label>
          <textarea name="aboutUs" value={formData.aboutUs} onChange={handleChange} rows={4} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-trust-blue-500" placeholder="Hakkımızda sayfasına yazılacak metin..." />
        </div>
      </div>

      <h3 className="text-lg font-semibold text-neutral-900 mb-4 border-b pb-2">Kargo Ayarları</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div>
          <label className="block text-sm font-medium text-neutral-900 mb-1">Sabit Kargo Ücreti (TL)</label>
          <input type="number" name="shippingFee" value={formData.shippingFee} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-trust-blue-500" placeholder="Örn: 110" />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-900 mb-1">Ücretsiz Kargo Baremi (TL)</label>
          <input type="number" name="shippingThreshold" value={formData.shippingThreshold} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-trust-blue-500" placeholder="Örn: 500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-900 mb-1">Aynı Gün Kargo Saati</label>
          <input type="time" name="sameDayShippingTime" value={formData.sameDayShippingTime} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-trust-blue-500" />
        </div>
      </div>

      {/* BirFatura Entegrasyon Ayarları */}
      <div className="bg-gradient-to-br from-indigo-50/70 to-blue-50/50 border border-indigo-100 rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-4 border-b border-indigo-100 pb-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🧾</span>
            <div>
              <h3 className="text-lg font-bold text-indigo-900">BirFatura Özel Entegrasyon Ayarları</h3>
              <p className="text-xs text-indigo-700">Fodos siparişlerini BirFatura paneline otomatik bağlamak ve e-Fatura / e-Arşiv kesmek için gereklidir.</p>
            </div>
          </div>
          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Entegrasyon Hazır
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-semibold text-neutral-900">BirFatura API Anahtarı (Token)</label>
              <button
                type="button"
                onClick={() => {
                  const newKey = 'bf_fodos_' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36)
                  setFormData({ ...formData, birfaturaApiKey: newKey })
                }}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium underline"
              >
                Yeni Anahtar Üret
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                name="birfaturaApiKey"
                value={formData.birfaturaApiKey}
                onChange={handleChange}
                className="w-full px-4 py-2 font-mono text-xs border border-indigo-200 rounded-lg bg-neutral-0 focus:ring-2 focus:ring-indigo-500"
                placeholder="API Anahtarı"
              />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(formData.birfaturaApiKey)
                  setCopiedField('apiKey')
                  setTimeout(() => setCopiedField(null), 2000)
                }}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors whitespace-nowrap"
              >
                {copiedField === 'apiKey' ? '✓ Kopyalandı' : 'Kopyala'}
              </button>
            </div>
            <p className="text-xs text-neutral-500 mt-1">BirFatura paneline girilecek gizli erişim anahtarınız.</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-1">Varsayılan KDV Oranı (%)</label>
            <input
              type="number"
              name="birfaturaKdvRate"
              value={formData.birfaturaKdvRate}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-indigo-200 rounded-lg bg-neutral-0 focus:ring-2 focus:ring-indigo-500"
              placeholder="Örn: 20"
            />
            <p className="text-xs text-neutral-500 mt-1">Fatura kalemleri için varsayılan KDV yüzdesi (%20).</p>
          </div>
        </div>

        {/* URL Bağlantıları */}
        <div className="space-y-4 bg-neutral-0/80 p-4 rounded-lg border border-indigo-100 mb-6">
          <div>
            <label className="block text-xs font-bold text-neutral-900 uppercase tracking-wider mb-1">
              1. Sipariş Çekme URL'si (BirFatura "Sipariş Listeleme URL" alanına):
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={typeof window !== 'undefined' ? `${window.location.origin}/api/birfatura/orders` : 'https://fodos.com.tr/api/birfatura/orders'}
                className="w-full px-3 py-1.5 font-mono text-xs bg-neutral-50 border border-neutral-200 rounded text-neutral-900"
              />
              <button
                type="button"
                onClick={() => {
                  const url = typeof window !== 'undefined' ? `${window.location.origin}/api/birfatura/orders` : 'https://fodos.com.tr/api/birfatura/orders'
                  navigator.clipboard.writeText(url)
                  setCopiedField('ordersUrl')
                  setTimeout(() => setCopiedField(null), 2000)
                }}
                className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-xs font-semibold rounded transition-colors whitespace-nowrap border"
              >
                {copiedField === 'ordersUrl' ? '✓ Kopyalandı' : 'Kopyala'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-900 uppercase tracking-wider mb-1">
              2. Fatura & Kargo Durum Güncelleme URL'si (Webhook):
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={typeof window !== 'undefined' ? `${window.location.origin}/api/birfatura/update-status` : 'https://fodos.com.tr/api/birfatura/update-status'}
                className="w-full px-3 py-1.5 font-mono text-xs bg-neutral-50 border border-neutral-200 rounded text-neutral-900"
              />
              <button
                type="button"
                onClick={() => {
                  const url = typeof window !== 'undefined' ? `${window.location.origin}/api/birfatura/update-status` : 'https://fodos.com.tr/api/birfatura/update-status'
                  navigator.clipboard.writeText(url)
                  setCopiedField('webhookUrl')
                  setTimeout(() => setCopiedField(null), 2000)
                }}
                className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-xs font-semibold rounded transition-colors whitespace-nowrap border"
              >
                {copiedField === 'webhookUrl' ? '✓ Kopyalandı' : 'Kopyala'}
              </button>
            </div>
          </div>
        </div>

        {/* Kurulum Rehberi */}
        <div className="text-xs text-indigo-900 bg-indigo-100/50 p-4 rounded-lg border border-indigo-200/60">
          <p className="font-bold mb-1">💡 BirFatura Paneline Nasıl Bağlanır?</p>
          <ol className="list-decimal list-inside space-y-1 text-indigo-800">
            <li>BirFatura panelinizde <strong>Ayarlar → Mağaza Ayarları → Yeni Mağaza Ekle → Özel Entegrasyon (veya XML/API Mağaza)</strong> bölümüne gidin.</li>
            <li>Mağaza Adı olarak <strong>FODOS</strong> girin.</li>
            <li>Yukarıdaki <strong>Sipariş Çekme URL</strong>'sini ve <strong>API Anahtarı</strong>'nı ilgili alanlara yapıştırıp kaydedin.</li>
            <li>Siparişleriniz BirFatura'ya otomatik aktarılacak ve fatura kesildiğinde faturanız doğrudan Fodos paneline yansıyacaktır.</li>
          </ol>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-neutral-900 mb-4 border-b pb-2">Yasal Sözleşmeler ve Belgeler</h3>
      <p className="text-sm text-neutral-500 mb-6">Aşağıdaki alanlara sözleşme metinlerinizi yapıştırabilirsiniz. Doldurduğunuz belgelerin linkleri otomatik olarak sitenin en altında (footer) görünecektir.</p>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-neutral-900 mb-1">Mesafeli Satış Sözleşmesi</label>
          <textarea name="mesafeliSatisHtml" value={formData.mesafeliSatisHtml} onChange={handleChange} rows={6} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-trust-blue-500" placeholder="Sözleşme metnini buraya yapıştırın..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-900 mb-1">Gizlilik ve Güvenlik Politikası</label>
          <textarea name="gizlilikGuvenlikHtml" value={formData.gizlilikGuvenlikHtml} onChange={handleChange} rows={6} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-trust-blue-500" placeholder="Politika metnini buraya yapıştırın..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-900 mb-1">İptal ve İade Koşulları</label>
          <textarea name="iptalIadeHtml" value={formData.iptalIadeHtml} onChange={handleChange} rows={6} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-trust-blue-500" placeholder="İade koşullarını buraya yapıştırın..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-900 mb-1">Kargo Takibi ve Süreçleri</label>
          <textarea name="kargoTakipHtml" value={formData.kargoTakipHtml} onChange={handleChange} rows={6} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-trust-blue-500" placeholder="Kargo bilgilendirmesini buraya yapıştırın..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-900 mb-1">Kişisel Veriler Politikası (KVKK)</label>
          <textarea name="kisiselVerilerHtml" value={formData.kisiselVerilerHtml} onChange={handleChange} rows={6} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-trust-blue-500" placeholder="KVKK metnini buraya yapıştırın..." />
        </div>
      </div>

      <div className="mt-8 flex items-center gap-4">
        <button type="submit" disabled={saving} className="px-6 py-3 bg-trust-blue-600 text-white font-medium rounded-lg hover:bg-trust-blue-600/90 transition-colors disabled:opacity-50">
          {saving ? 'Kaydediliyor...' : 'Tüm Bilgileri Kaydet'}
        </button>
        {message && <span className="text-sm font-medium text-emerald-800 bg-emerald-50 px-4 py-2 rounded-lg">{message}</span>}
      </div>
    </form>
  )
}
