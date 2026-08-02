'use client'

import { useState } from 'react'
import { logout } from './actions'

export function Dashboard() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Lütfen bir Excel dosyası seçin.')
      return
    }

    setUploading(true)
    setError('')
    setResult(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/admin/upload-excel', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (res.ok) {
        setResult(data)
      } else {
        setError(data.error || 'Yükleme sırasında bir hata oluştu.')
      }
    } catch (err) {
      setError('Bağlantı hatası.')
    } finally {
      setUploading(false)
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
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
            <input 
              type="file" 
              accept=".xlsx" 
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-trust-blue-50 file:text-trust-blue-600 hover:file:bg-trust-blue-100 cursor-pointer"
            />
            {file && <p className="mt-4 text-sm text-gray-600">Seçilen dosya: {file.name}</p>}
          </div>
          
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="mt-4 w-full py-3 bg-trust-blue-600 hover:bg-trust-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
          >
            {uploading ? 'İşleniyor, lütfen bekleyin (Bu işlem uzun sürebilir)...' : 'Yükle ve Senkronize Et'}
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
      </div>
    </div>
  )
}
