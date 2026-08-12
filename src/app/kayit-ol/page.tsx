'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    city: '',
    district: '',
    address: '',
    acceptTerms: false,
    acceptMarketing: false
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Kayıt işlemi başarısız')
      }

      window.location.href = '/' // Force hard reload to update header state
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 my-8">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-2xl w-full border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Hesap Oluştur</h1>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad *</label>
              <input 
                type="text" name="name" required
                value={formData.name} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-trust-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-posta *</label>
              <input 
                type="email" name="email" required
                value={formData.email} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-trust-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
              <input 
                type="tel" name="phone"
                value={formData.phone} onChange={handleChange}
                placeholder="05XX XXX XX XX"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-trust-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Şifre *</label>
              <input 
                type="password" name="password" required
                value={formData.password} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-trust-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">İl (Kargo İçin)</label>
              <input 
                type="text" name="city"
                value={formData.city} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-trust-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">İlçe (Kargo İçin)</label>
              <input 
                type="text" name="district"
                value={formData.district} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-trust-blue-500 outline-none"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Açık Adres</label>
            <textarea 
              name="address" rows={3}
              value={formData.address} onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-trust-blue-500 outline-none"
            />
          </div>

          <div className="space-y-3 mt-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                name="acceptTerms"
                required
                checked={formData.acceptTerms}
                onChange={handleChange}
                className="mt-1 w-4 h-4 text-trust-blue-600 rounded border-gray-300 focus:ring-trust-blue-500"
              />
              <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                <Link href="/mesafeli-satis-sozlesmesi" target="_blank" className="text-trust-blue-600 hover:underline font-semibold">Üyelik Sözleşmesi</Link>'ni ve <Link href="/kvkk" target="_blank" className="text-trust-blue-600 hover:underline font-semibold">KVKK Aydınlatma Metni</Link>'ni okudum ve kabul ediyorum.
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                name="acceptMarketing"
                checked={formData.acceptMarketing}
                onChange={handleChange}
                className="mt-1 w-4 h-4 text-trust-blue-600 rounded border-gray-300 focus:ring-trust-blue-500"
              />
              <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                Kampanya, indirim ve yeni ürünlerden haberdar olmak için tarafıma Ticari Elektronik İleti gönderilmesine izin veriyorum. (İsteğe bağlı)
              </span>
            </label>
          </div>

          <button 
            type="submit" 
            disabled={loading || !formData.acceptTerms}
            className="w-full bg-trust-blue-600 hover:bg-trust-blue-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 mt-4 disabled:cursor-not-allowed"
          >
            {loading ? 'Kayıt Yapılıyor...' : 'Kayıt Ol'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Zaten hesabınız var mı? <Link href="/giris" className="text-trust-blue-600 font-semibold hover:underline">Giriş Yapın</Link>
        </div>
      </div>
    </div>
  )
}
