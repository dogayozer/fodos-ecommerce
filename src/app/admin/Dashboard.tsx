'use client'

import { useState } from 'react'
import { logout } from './actions'
import * as xlsx from 'xlsx'
import { SettingsForm } from './SettingsForm'
import { CouponManager } from './CouponManager'
import { CategoryManager } from './CategoryManager'
import { OrderNotifier, playNotificationSound } from '@/components/OrderNotifier'

export function Dashboard() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [priceIncreasePercent, setPriceIncreasePercent] = useState<string>('')
  const [discountPercent, setDiscountPercent] = useState<string>('')

  // Bulk Update States
  const [bulkIncrease, setBulkIncrease] = useState<string>('')
  const [bulkDiscount, setBulkDiscount] = useState<string>('')
  const [modelFilter, setModelFilter] = useState<string>('')
  const [bulkUpdating, setBulkUpdating] = useState(false)
  const [bulkResult, setBulkResult] = useState<any>(null)
  const [bulkError, setBulkError] = useState('')
  const [bulkTargetStore, setBulkTargetStore] = useState<'fodos' | 'mpm'>('fodos')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const [uploadProgress, setUploadProgress] = useState<{current: number, total: number} | null>(null)

  const handleUpload = async () => {
    if (!file) {
      setError('Lütfen bir Excel dosyası seçin.')
      return
    }

    setUploading(true)
    setError('')
    setResult(null)
    setUploadProgress(null)

    try {
      // 1. Dosyayı tarayıcıda oku
      const buffer = await file.arrayBuffer()
      const workbook = xlsx.read(buffer, { type: 'buffer' })
      const sheetName = workbook.SheetNames[0]
      const sheet = workbook.Sheets[sheetName]
      const rows = xlsx.utils.sheet_to_json(sheet) as any[]

      if (rows.length === 0) {
        throw new Error('Excel dosyası boş.')
      }

      // Tüm barkodları topla (son pakette pasife çekme işlemi için)
      const allProcessedBarcodes = rows
        .map(r => String(r['Barkod'] || '').trim())
        .filter(b => b.length > 0)

      // 2. Satırları 100'erli paketlere böl
      const CHUNK_SIZE = 100
      const chunks = []
      for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
        chunks.push(rows.slice(i, i + CHUNK_SIZE))
      }

      setUploadProgress({ current: 0, total: chunks.length })

      let totalCreated = 0
      let totalUpdated = 0
      let totalDeactivated = 0

      // 3. Paketleri sırayla sunucuya gönder
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i]
        const isFinalBatch = (i === chunks.length - 1)

        const payload = {
          chunk,
          priceIncreasePercent: parseFloat(priceIncreasePercent) || 0,
          discountPercent: parseFloat(discountPercent) || 0,
          filename: file.name,
          isFinalBatch,
          allProcessedBarcodes: isFinalBatch ? allProcessedBarcodes : undefined
        }

        const res = await fetch('/api/admin/upload-excel-batch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload),
        })

        const data = await res.json()
        if (!res.ok) {
          throw new Error(data.error || `Paket ${i+1} yüklenirken hata oluştu.`)
        }

        totalCreated += (data.summary?.created || 0)
        totalUpdated += (data.summary?.updated || 0)
        totalDeactivated += (data.summary?.deactivated || 0)

        setUploadProgress({ current: i + 1, total: chunks.length })
      }

      setResult({
        summary: {
          total: rows.length,
          created: totalCreated,
          updated: totalUpdated,
          deactivated: totalDeactivated
        }
      })
      
    } catch (err: any) {
      setError(err.message || 'Bağlantı hatası veya okuma hatası.')
    } finally {
      setUploading(false)
      setUploadProgress(null)
    }
  }

  const handleBulkUpdate = async (resetToOriginal: boolean = false) => {
    if (!resetToOriginal && !bulkIncrease && !bulkDiscount) {
      setBulkError('Lütfen zam veya indirim oranı girin, ya da Orijinale Dön butonunu kullanın.')
      return
    }

    setBulkUpdating(true)
    setBulkError('')
    setBulkResult(null)

    try {
      const res = await fetch('/api/admin/bulk-price-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          increasePercent: parseFloat(bulkIncrease) || 0,
          discountPercent: parseFloat(bulkDiscount) || 0,
          modelFilter: modelFilter.trim(),
          resetToOriginal,
          targetStore: bulkTargetStore
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Toplu güncelleme sırasında hata oluştu.')
      }

      setBulkResult(data.summary)
    } catch (err: any) {
      setBulkError(err.message || 'Bağlantı hatası.')
    } finally {
      setBulkUpdating(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <OrderNotifier />
      <div className="max-w-4xl mx-auto bg-neutral-0 rounded-xl shadow-[var(--shadow-card)] border border-neutral-200 p-6">
        <div className="flex justify-between items-center border-b pb-4 mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-trust-blue-600">Admin Dashboard</h1>
            <span className="bg-trust-blue-100 text-trust-blue-600 text-xs font-bold px-2 py-1 rounded">v2.1</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => playNotificationSound()}
              className="text-sm px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-md transition-colors"
            >
              🔔 Sesi Test Et
            </button>
            <button
              onClick={handleLogout}
              className="text-sm px-4 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors text-neutral-900"
            >
              Çıkış Yap
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="p-6 bg-neutral-0 border border-trust-blue-100 rounded-xl shadow-[var(--shadow-card)] flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold mb-1 text-trust-blue-600">Sipariş Yönetimi</h2>
              <p className="text-sm text-neutral-500 mb-4">Gelen siparişleri görüntüle, fatura yazdır, kargo numaralarını gir ve sipariş notu ekle.</p>
            </div>
            <a href="/admin/siparisler" className="bg-trust-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-trust-blue-600/90 transition-colors shadow-[var(--shadow-button)] text-center inline-block">
              Siparişlere Git
            </a>
          </div>

          <div className="p-6 bg-neutral-0 border border-indigo-100 rounded-xl shadow-[var(--shadow-card)] flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold mb-1 text-indigo-800">Üyelik Yönetimi</h2>
              <p className="text-sm text-neutral-500 mb-4">Kayıtlı müşterilerinizi, iletişim bilgilerini ve geçmiş alışveriş detaylarını görüntüleyin.</p>
            </div>
            <a href="/admin/uyeler" className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-[var(--shadow-button)] text-center inline-block">
              Üyelere Git
            </a>
          </div>

          <div className="p-6 bg-neutral-0 border border-action-orange-500/20 rounded-xl shadow-[var(--shadow-card)] flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold mb-1 text-action-orange-600">Pazaryeri Siparişleri</h2>
              <p className="text-sm text-neutral-500 mb-4">Trendyol, Hepsiburada, N11, Çiçeksepeti siparişlerini tek ekranda topla, işleme al, tedarik notu gir.</p>
            </div>
            <a href="/admin/pazaryeri-siparisleri" className="bg-action-orange-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-action-orange-600 transition-colors shadow-[var(--shadow-button)] text-center inline-block">
              Pazaryeri Siparişlerine Git
            </a>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-neutral-900">Trendyol Ürün Senkronizasyonu (Excel)</h2>
          <div className="border-2 border-dashed border-neutral-200 rounded-lg p-8 text-center bg-neutral-50 mb-4">
            <input
              type="file"
              accept=".xlsx"
              onChange={handleFileChange}
              className="block w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-trust-blue-50 file:text-trust-blue-600 hover:file:bg-trust-blue-100 cursor-pointer"
            />
            {file && <p className="mt-4 text-sm text-neutral-500">Seçilen dosya: {file.name}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-1">Fiyata Eklenecek Zam Oranı (%)</label>
              <input
                type="number"
                placeholder="Örn: 40 (Boş bırakırsanız değişmez)"
                value={priceIncreasePercent}
                onChange={(e) => setPriceIncreasePercent(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-trust-blue-500 focus:outline-none"
              />
              <p className="text-xs text-neutral-500 mt-1">Trendyol fiyatına bu oranda zam yapılıp üstü çizili fiyat (referans) oluşturulur.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-1">Uygulanacak İndirim Oranı (%)</label>
              <input
                type="number"
                placeholder="Örn: 40 (Boş bırakırsanız değişmez)"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-trust-blue-500 focus:outline-none"
              />
              <p className="text-xs text-neutral-500 mt-1">Oluşturulan zamlı fiyattan yapılacak indirimle son satış fiyatı belirlenir.</p>
            </div>
          </div>

          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="mt-4 w-full py-3 bg-trust-blue-600 hover:bg-trust-blue-600/90 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
          >
            {uploading ? (
              uploadProgress ? `İşleniyor: Paket ${uploadProgress.current} / ${uploadProgress.total} yükleniyor...` : 'İşleniyor, lütfen bekleyin...'
            ) : 'Yükle ve Senkronize Et'}
          </button>

          {error && (
            <div className="mt-4 p-4 bg-risk-red-500/10 text-risk-red-500 rounded-md border border-risk-red-500/20">
              {error}
            </div>
          )}

          {result && (
            <div className="mt-6 p-4 bg-green-50 text-green-800 rounded-md border border-green-100">
              <h3 className="font-bold mb-2">Senkronizasyon Özeti</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Yeni Eklenen: {result.summary.created}</li>
                <li>Güncellenen: {result.summary.updated}</li>
                <li>Pasife Çekilen (Excel'de olmayan): {result.summary.deactivated}</li>
                <li>Toplam İşlenen: {result.summary.total}</li>
              </ul>
            </div>
          )}
        </div>

        {/* Bulk Update Section */}
        <div className="mb-8 p-6 bg-neutral-0 border border-neutral-200 rounded-xl shadow-[var(--shadow-card)]">
          <h2 className="text-lg font-semibold mb-4 text-neutral-900">Toplu Fiyat Güncelleme</h2>
          <p className="text-sm text-neutral-500 mb-4">Excel'de kayıtlı orijinal piyasa fiyatları (`original_excel_price`) üzerinden tüm sisteme zam/indirim uygulayın.</p>

          <div className="mb-6">
            <label className="block text-sm font-medium text-neutral-900 mb-2">Hangi Marka İçin Uygulanacak?</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setBulkTargetStore('fodos')}
                className={`px-4 py-2 rounded-lg text-sm font-bold border transition-colors ${
                  bulkTargetStore === 'fodos'
                    ? 'bg-trust-blue-600 text-white border-trust-blue-600'
                    : 'bg-neutral-0 text-neutral-500 border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                Fodos
              </button>
              <button
                type="button"
                onClick={() => setBulkTargetStore('mpm')}
                className={`px-4 py-2 rounded-lg text-sm font-bold border transition-colors ${
                  bulkTargetStore === 'mpm'
                    ? 'bg-trust-blue-600 text-white border-trust-blue-600'
                    : 'bg-neutral-0 text-neutral-500 border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                Mobil Parça Merkezi
              </button>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              {bulkTargetStore === 'fodos'
                ? 'Fodos\'un normal satış fiyatı (sale_price / reference_price) güncellenir.'
                : 'Sadece Mobil Parça Merkezi\'ne özel fiyat (mpm_sale_price / mpm_reference_price) güncellenir, Fodos fiyatı değişmez.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-1">Model Kodu ile Filtrele</label>
              <input
                type="text"
                placeholder="Örn: iPhone 14 Pro"
                value={modelFilter}
                onChange={(e) => setModelFilter(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-trust-blue-500 focus:outline-none"
              />
              <p className="text-xs text-neutral-500 mt-1">Sadece bu kelimeyi içeren modeller güncellenir. Boş bırakırsanız hepsi güncellenir.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-1">Zam Oranı (%)</label>
              <input
                type="number"
                placeholder="Örn: 20"
                value={bulkIncrease}
                onChange={(e) => setBulkIncrease(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-trust-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-1">İndirim Oranı (%)</label>
              <input
                type="number"
                placeholder="Örn: 10"
                value={bulkDiscount}
                onChange={(e) => setBulkDiscount(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-trust-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => handleBulkUpdate(false)}
              disabled={bulkUpdating || (!bulkIncrease && !bulkDiscount)}
              className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
            >
              {bulkUpdating ? 'Fiyatlar Güncelleniyor...' : 'Fiyatları Güncelle'}
            </button>
            <button
              onClick={() => {
                if (window.confirm('Tüm fiyatlar Excel\'deki orijinal piyasa satış fiyatlarına dönecek. Emin misiniz?')) {
                  handleBulkUpdate(true)
                }
              }}
              disabled={bulkUpdating}
              className="flex-1 py-3 bg-neutral-500 hover:bg-neutral-900 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
            >
              Excel Fiyatlarına Geri Dön
            </button>
          </div>

          {bulkError && (
            <div className="mt-4 p-4 bg-risk-red-500/10 text-risk-red-500 rounded-md border border-risk-red-500/20">
              {bulkError}
            </div>
          )}

          {bulkResult && (
            <div className="mt-4 p-4 bg-emerald-50 text-emerald-800 rounded-md border border-emerald-100">
              <h3 className="font-bold mb-2">Güncelleme Başarılı</h3>
              <p className="text-sm">Başarıyla güncellenen ürün sayısı: <strong>{bulkResult.updatedCount}</strong></p>
            </div>
          )}
        </div>

        {/* Sürüm Notları */}
        <div className="mt-8 bg-trust-blue-50 border border-trust-blue-100 rounded-lg p-5">
          <h3 className="text-sm font-bold text-trust-blue-600 mb-2">Sistem Güncelleme Notları (v2.1 - BirFatura Entegrasyonu)</h3>
          <ul className="list-disc pl-5 text-xs text-trust-blue-600 space-y-1">
            <li><strong>YENİ - BİRFATURA ENTEGRASYONU:</strong> Tüm siparişlerinizi tek bir yerden yönetmek ve e-Fatura / e-Arşiv kesmek için BirFatura Özel Entegrasyon altyapısı ve webhook bağlantıları eklendi. Aşağıdaki ayarlardan API anahtarınızı alabilirsiniz.</li>
            <li><strong>YENİ - SİPARİŞLER & FATURA ROZETLERİ:</strong> Sipariş yönetiminde fatura durumu (Faturalandı / Fatura Bekliyor), hızlı PDF fatura açma ve arama filtreleri eklendi.</li>
            <li><strong>CANLI BİLDİRİMLER:</strong> Sipariş geldiğinde anında pop-up ve sesli uyarı veren bildirim sistemi devrede.</li>
          </ul>
        </div>
      </div>
      
      {/* Category Manager */}
      <div className="max-w-4xl mx-auto mt-8">
        <CategoryManager />
      </div>

      {/* Coupon Manager */}
      <div className="max-w-4xl mx-auto mt-8">
        <CouponManager />
      </div>

      {/* Settings Form */}
      <div className="max-w-4xl mx-auto mt-8">
        <SettingsForm />
      </div>
    </div>
  )
}
