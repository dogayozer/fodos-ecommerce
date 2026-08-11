'use client'

import { useState, useEffect } from 'react'

export function CategoryManager() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  // Add category state
  const [addName, setAddName] = useState('')
  const [addSlug, setAddSlug] = useState('')
  const [addTemplate, setAddTemplate] = useState('case')
  
  // Bulk move state
  const [searchWord, setSearchWord] = useState('')
  const [targetCategoryId, setTargetCategoryId] = useState('')
  const [moving, setMoving] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories')
      const data = await res.json()
      if (res.ok) {
        setCategories(data.categories)
      } else {
        throw new Error(data.error)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    setError('')
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: addName, slug: addSlug, template_type: addTemplate })
      })
      const data = await res.json()
      if (res.ok) {
        setAddName('')
        setAddSlug('')
        setAddTemplate('case')
        setMessage('Kategori eklendi.')
        fetchCategories()
      } else {
        setError(data.error)
      }
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleDelete = async (id: string, productCount: number) => {
    if (productCount > 0) {
      if (!window.confirm(`DİKKAT! Bu kategoride ${productCount} ürün var. Kategoriyi silmek ürünleri "kategorisiz" yapabilir. Devam etmek istiyor musunuz?`)) {
        return
      }
    } else {
      if (!window.confirm('Kategoriyi silmek istediğinize emin misiniz?')) {
        return
      }
    }

    try {
      const res = await fetch('/api/admin/categories', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      const data = await res.json()
      if (res.ok) {
        setMessage('Kategori silindi.')
        fetchCategories()
      } else {
        setError(data.error)
      }
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleBulkMove = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchWord || !targetCategoryId) {
      setError('Arama kelimesi ve hedef kategori zorunludur.')
      return
    }
    
    if (!window.confirm(`Başlığında veya açıklamasında "${searchWord}" geçen tüm ürünleri seçili kategoriye taşımak istediğinize emin misiniz?`)) return
    
    setMoving(true)
    setError('')
    setMessage('')
    try {
      const res = await fetch('/api/admin/categories/bulk-move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ searchWord, targetCategoryId })
      })
      const data = await res.json()
      if (res.ok) {
        setMessage(`İşlem başarılı. Toplam ${data.updatedCount} ürün taşındı.`)
        fetchCategories() // to update product counts
      } else {
        setError(data.error)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setMoving(false)
    }
  }

  if (loading) return <div className="p-6">Yükleniyor...</div>

  return (
    <div className="space-y-8">
      {message && <div className="p-4 bg-green-50 text-green-700 rounded-lg">{message}</div>}
      {error && <div className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>}

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-2">Kategori Listesi & Ekleme</h2>
        
        <form onSubmit={handleAdd} className="flex gap-4 mb-8 bg-gray-50 p-4 rounded-lg">
          <div className="flex-1">
            <input type="text" required placeholder="Kategori Adı (Örn: Kulaklıklar)" value={addName} onChange={e => {
              setAddName(e.target.value)
              if (!addSlug) {
                setAddSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'))
              }
            }} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-trust-blue-500" />
          </div>
          <div className="flex-1">
            <input type="text" required placeholder="URL Slug (Örn: kulakliklar)" value={addSlug} onChange={e => setAddSlug(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-trust-blue-500" />
          </div>
          <div className="w-48">
            <select value={addTemplate} onChange={e => setAddTemplate(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-trust-blue-500">
              <option value="case">Kılıf (case)</option>
              <option value="cable">Kablo (cable)</option>
              <option value="charger">Şarj (charger)</option>
              <option value="protector">Ekran Koruyucu (protector)</option>
              <option value="generic">Genel (generic)</option>
            </select>
          </div>
          <button type="submit" className="bg-trust-blue-600 hover:bg-trust-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
            Ekle
          </button>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">Kategori Adı</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Şablon</th>
                <th className="px-4 py-3">Ürün Sayısı</th>
                <th className="px-4 py-3 rounded-tr-lg text-right">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold text-gray-900">{c.name}</td>
                  <td className="px-4 py-3 text-gray-500">{c.slug}</td>
                  <td className="px-4 py-3">{c.template_type}</td>
                  <td className="px-4 py-3 font-medium text-trust-blue-600">{c._count?.products || 0} ürün</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDelete(c.id, c._count?.products || 0)} className="text-red-600 hover:underline">Sil</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm border-l-4 border-l-amber-500">
        <h2 className="text-xl font-bold mb-2 text-gray-800">Toplu Kategori Taşıma</h2>
        <p className="text-sm text-gray-600 mb-6">Belirttiğiniz kelimeyi başlığında veya açıklamasında barındıran tüm ürünleri seçili kategoriye taşır. Örn: "Kulaklık" kelimesini aratıp tümünü Kulaklıklar kategorisine taşıyabilirsiniz.</p>
        
        <form onSubmit={handleBulkMove} className="flex gap-4">
          <div className="flex-1">
            <input type="text" required placeholder="Arama Kelimesi (Örn: Kulaklık)" value={searchWord} onChange={e => setSearchWord(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-trust-blue-500" />
          </div>
          <div className="flex-1">
            <select required value={targetCategoryId} onChange={e => setTargetCategoryId(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-trust-blue-500">
              <option value="" disabled>Hedef Kategori Seçin</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={moving} className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white px-8 py-2 rounded-lg font-medium transition-colors">
            {moving ? 'Taşınıyor...' : 'Bul ve Taşı'}
          </button>
        </form>
      </div>
    </div>
  )
}
