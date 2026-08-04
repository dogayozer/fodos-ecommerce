'use client'

import { useState } from 'react'
import { logout } from './actions'
import * as xlsx from 'xlsx'

export function Dashboard() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [priceIncreasePercent, setPriceIncreasePercent] = useState<string>('')
  const [discountPercent, setDiscountPercent] = useState<string>('')

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

  const handleLogout = async () => {
    await logout()
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center border-b pb-4 mb-6">
          <h1 className="text-2xl font-bold text-trust-blue-600">Admin Dashboard</h1>
          <button 
            onClick={handleLogout}
            className="text-sm px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors text-gray-700"
          >
            Çıkış Yap
          </button>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Trendyol Ürün Senkronizasyonu (Excel)</h2>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50 mb-4">
            <input 
              type="file" 
              accept=".xlsx" 
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-trust-blue-50 file:text-trust-blue-600 hover:file:bg-trust-blue-100 cursor-pointer"
            />
            {file && <p className="mt-4 text-sm text-gray-600">Seçilen dosya: {file.name}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fiyata Eklenecek Zam Oranı (%)</label>
              <input 
                type="number" 
                placeholder="Örn: 40 (Boş bırakırsanız değişmez)" 
                value={priceIncreasePercent}
                onChange={(e) => setPriceIncreasePercent(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-trust-blue-500 focus:outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">Trendyol fiyatına bu oranda zam yapılıp üstü çizili fiyat (referans) oluşturulur.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Uygulanacak İndirim Oranı (%)</label>
              <input 
                type="number" 
                placeholder="Örn: 40 (Boş bırakırsanız değişmez)" 
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-trust-blue-500 focus:outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">Oluşturulan zamlı fiyattan yapılacak indirimle son satış fiyatı belirlenir.</p>
            </div>
          </div>
          
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="mt-4 w-full py-3 bg-trust-blue-600 hover:bg-trust-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
          >
            {uploading ? (
              uploadProgress ? `İşleniyor: Paket ${uploadProgress.current} / ${uploadProgress.total} yükleniyor...` : 'İşleniyor, lütfen bekleyin...'
            ) : 'Yükle ve Senkronize Et'}
          </button>

          {error && (
            <div className="mt-4 p-4 bg-red-50 text-risk-red-500 rounded-md border border-red-100">
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

        {/* Sürüm Notları */}
        <div className="mt-8 bg-blue-50 border border-blue-100 rounded-lg p-5">
          <h3 className="text-sm font-bold text-trust-blue-700 mb-2">Sistem Güncelleme Notları (v1.3 - 5 Ağustos 2026, 00:38)</h3>
          <ul className="list-disc pl-5 text-xs text-trust-blue-600 space-y-1">
            <li><strong>YENİ:</strong> Yan menü 2 kademeli (Kategori &gt; Marka) olarak tamamen sadeleştirildi.</li>
            <li><strong>YENİ:</strong> Kategori sayfasına anlık model arama ve filtreleme sistemi (ModelFilter) eklendi.</li>
            <li><strong>GÜNCELLEME:</strong> Excel aktarımında sütun eşleştirmeleri (kategori_ismi, urun_markasi, urun_modeli) revize edildi.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
