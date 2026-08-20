'use client'

import { useState } from 'react'
import { updateProfile } from '@/app/actions/profile'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

export function ProfileForm({ customer }: { customer: any }) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    const formData = new FormData(e.currentTarget)
    
    try {
      const result = await updateProfile(formData)
      
      if (result.success) {
        setMessage({ type: 'success', text: 'Profil bilgileriniz başarıyla güncellendi.' })
      } else {
        setMessage({ type: 'error', text: result.error || 'Bir hata oluştu.' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Sistemsel bir hata oluştu. Lütfen tekrar deneyin.' })
    } finally {
      setIsLoading(false)
      // Hide success message after 3 seconds
      setTimeout(() => {
        setMessage(null)
      }, 3000)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
      
      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span className="font-medium text-sm">{message.text}</span>
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad</label>
        <input 
          type="text" 
          id="name"
          name="name" 
          defaultValue={customer.name || ''} 
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-trust-blue-500 focus:border-trust-blue-500 outline-none transition-all"
          placeholder="Adınız Soyadınız"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-500 mb-1">E-Posta Adresi</label>
        <input 
          type="email" 
          value={customer.email || ''} 
          disabled
          className="w-full px-4 py-2 border border-gray-200 bg-gray-50 text-gray-500 rounded-lg cursor-not-allowed"
        />
        <p className="text-xs text-gray-400 mt-1">E-posta adresi güvenlik amacıyla değiştirilemez.</p>
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Telefon Numarası</label>
        <input 
          type="tel" 
          id="phone"
          name="phone" 
          defaultValue={customer.phone || ''} 
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-trust-blue-500 focus:border-trust-blue-500 outline-none transition-all"
          placeholder="05XX XXX XX XX"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">İl</label>
          <input 
            type="text" 
            id="city"
            name="city" 
            defaultValue={customer.city || ''} 
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-trust-blue-500 focus:border-trust-blue-500 outline-none transition-all"
            placeholder="İl"
          />
        </div>
        <div>
          <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">İlçe</label>
          <input 
            type="text" 
            id="district"
            name="district" 
            defaultValue={customer.district || ''} 
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-trust-blue-500 focus:border-trust-blue-500 outline-none transition-all"
            placeholder="İlçe"
          />
        </div>
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Açık Adres</label>
        <textarea 
          id="address"
          name="address" 
          defaultValue={customer.address || ''} 
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-trust-blue-500 focus:border-trust-blue-500 outline-none transition-all resize-none"
          placeholder="Mahalle, sokak, bina no, daire no..."
        />
      </div>

      <button 
        type="submit" 
        disabled={isLoading}
        className="w-full bg-trust-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-trust-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader2 size={18} className="animate-spin" /> Kaydediliyor...
          </>
        ) : (
          'Değişiklikleri Kaydet'
        )}
      </button>
    </form>
  )
}
