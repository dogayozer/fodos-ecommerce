'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CheckoutPage() {
  const [cart, setCart] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    district: '',
    address: '',
    acceptTerms: false,
    acceptKvkk: false
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    const existingCartStr = localStorage.getItem('cart')
    if (existingCartStr) {
      setCart(JSON.parse(existingCartStr))
    }

    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user)
          setFormData({
            name: data.user.name || '',
            email: data.user.email || '',
            phone: data.user.phone || '',
            city: data.user.city || '',
            district: data.user.district || '',
            address: data.user.address || '',
            acceptTerms: false,
            acceptKvkk: false
          })
        }
      })
      .catch(() => {})
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const couponStr = localStorage.getItem('appliedCoupon')
      const coupon = couponStr ? JSON.parse(couponStr) : null

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerInfo: formData,
          cart,
          couponCode: coupon?.code
        })
      })

      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Sipariş oluşturulamadı')
      }

      // Clear cart
      localStorage.removeItem('cart')
      localStorage.removeItem('appliedCoupon')
      window.dispatchEvent(new Event('cartUpdated'))

      // Redirect to WhatsApp
      window.location.href = data.whatsappUrl

    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  if (!mounted) return <div className="py-20 text-center">Yükleniyor...</div>
  if (cart.length === 0) return (
    <div className="py-20 text-center max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Sepetiniz boş</h2>
      <Link href="/" className="text-trust-blue-600 hover:underline">Alışverişe devam et</Link>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 flex-1 w-full">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Ödeme & Teslimat</h1>
      
      {!user && (
        <div className="mb-8 p-4 bg-blue-50 border border-blue-100 rounded-xl flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-blue-900">Hesabınız var mı?</h3>
            <p className="text-sm text-blue-700">Daha hızlı işlem yapmak ve %5 daimi müşteri indiriminden faydalanmak için giriş yapın. Kayıt olmadan da devam edebilirsiniz.</p>
          </div>
          <Link href="/giris" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            Giriş Yap
          </Link>
        </div>
      )}

      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-6 border-b pb-2">Teslimat Bilgileri</h2>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleCheckout} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad *</label>
              <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-trust-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-posta Adresi *</label>
              <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-trust-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefon Numarası *</label>
              <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-trust-blue-500" placeholder="05XX XXX XX XX" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">İl *</label>
              <input type="text" name="city" required value={formData.city} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-trust-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">İlçe *</label>
              <input type="text" name="district" required value={formData.district} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-trust-blue-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Açık Adres *</label>
              <textarea name="address" required rows={3} value={formData.address} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-trust-blue-500" />
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mt-8">
            <h3 className="font-bold mb-2">Ödeme Bilgilendirmesi</h3>
            <p className="text-sm text-gray-600">POS sistemi güncellemelerimiz nedeniyle sipariş ödemeleri manuel olarak WhatsApp üzerinden alınmaktadır. Siparişi tamamla butonuna bastığınızda, siparişiniz sistemimize kaydedilecek ve ödeme yönergeleri için WhatsApp hattımıza yönlendirileceksiniz.</p>
          </div>

          <div className="space-y-3 mt-6 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
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
                <Link href="/mesafeli-satis-sozlesmesi" target="_blank" className="text-trust-blue-600 hover:underline font-semibold">Ön Bilgilendirme Formu</Link>'nu ve <Link href="/mesafeli-satis-sozlesmesi" target="_blank" className="text-trust-blue-600 hover:underline font-semibold">Mesafeli Satış Sözleşmesi</Link>'ni okudum ve onaylıyorum.
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                name="acceptKvkk"
                required
                checked={formData.acceptKvkk}
                onChange={handleChange}
                className="mt-1 w-4 h-4 text-trust-blue-600 rounded border-gray-300 focus:ring-trust-blue-500"
              />
              <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                Kişisel verilerimin işlenmesine ilişkin <Link href="/kvkk" target="_blank" className="text-trust-blue-600 hover:underline font-semibold">KVKK Aydınlatma Metni</Link>'ni okudum.
              </span>
            </label>
          </div>

          <button 
            type="submit" 
            disabled={loading || !formData.acceptTerms || !formData.acceptKvkk}
            className="w-full py-4 bg-cta-background hover:bg-cta-hover text-white rounded-xl font-bold transition-all shadow-md text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'İşleniyor...' : 'Siparişi Tamamla (WhatsApp\'a Yönlendirilir)'}
          </button>
        </form>
      </div>
    </div>
  )
}
