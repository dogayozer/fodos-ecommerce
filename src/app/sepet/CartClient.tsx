'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, ShieldCheck, Trash2, Plus, Minus } from 'lucide-react'
import { ShippingCounter } from './ShippingCounter'

export function CartClient({ targetTimeMs, message }: { targetTimeMs: number, message: string }) {
  const [cart, setCart] = useState<any[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const existingCartStr = localStorage.getItem('cart')
    if (existingCartStr) {
      setCart(JSON.parse(existingCartStr))
    }
  }, [])

  const updateQty = (id: string, delta: number) => {
    const newCart = [...cart]
    const index = newCart.findIndex(item => item.id === id)
    if (index > -1) {
      newCart[index].qty += delta
      if (newCart[index].qty <= 0) {
        newCart.splice(index, 1)
      }
      setCart(newCart)
      localStorage.setItem('cart', JSON.stringify(newCart))
      window.dispatchEvent(new Event('cartUpdated'))
    }
  }

  const removeItem = (id: string) => {
    const newCart = cart.filter(item => item.id !== id)
    setCart(newCart)
    localStorage.setItem('cart', JSON.stringify(newCart))
    window.dispatchEvent(new Event('cartUpdated'))
  }

  if (!mounted) return <div className="py-20 text-center text-gray-500">Yükleniyor...</div>

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0)
  const freeShippingThreshold = 950
  const neededForFreeShipping = freeShippingThreshold - cartTotal

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-2 space-y-4">
        <ShippingCounter targetTimeMs={targetTimeMs} message={message} />
        
        {cart.length === 0 ? (
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-gray-500 text-center py-8">Sepetinizde ürün bulunmamaktadır.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {cart.map((item, i) => (
              <div key={item.id + i} className="p-4 border-b border-gray-100 last:border-0 flex items-center gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 rounded flex items-center justify-center flex-shrink-0">
                  {item.image ? (
                    <img src={item.image} alt={item.title} className="max-w-full max-h-full object-contain p-2 mix-blend-multiply" />
                  ) : (
                    <span className="text-[10px] text-gray-300">Görsel</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/urun/${item.slug}`} className="text-xs sm:text-sm font-semibold text-gray-900 hover:text-trust-blue-600 line-clamp-2">
                    {item.title}
                  </Link>
                  <div className="text-action-orange-600 font-bold mt-1 text-sm sm:text-base">
                    {Number(item.price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 size={16} className="sm:w-5 sm:h-5" />
                  </button>
                  <div className="flex items-center border border-gray-200 rounded-lg">
                    <button onClick={() => updateQty(item.id, -1)} className="px-2 py-1 text-gray-500 hover:bg-gray-100 rounded-l-lg"><Minus size={12} className="sm:w-3.5 sm:h-3.5" /></button>
                    <span className="px-1 sm:px-2 py-1 text-xs sm:text-sm font-bold min-w-[1.5rem] sm:min-w-[2rem] text-center">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="px-2 py-1 text-gray-500 hover:bg-gray-100 rounded-r-lg"><Plus size={12} className="sm:w-3.5 sm:h-3.5" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="md:col-span-1">
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 sticky top-24">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Sipariş Özeti</h2>
          
          <div className="flex justify-between mb-2 text-gray-600 text-sm sm:text-base">
            <span>Ara Toplam</span>
            <span>{cartTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</span>
          </div>
          
          <div className="flex justify-between mb-4 text-gray-600 text-sm sm:text-base">
            <span>Kargo</span>
            <span>{cartTotal === 0 ? '0.00 TL' : neededForFreeShipping > 0 ? '49.90 TL' : 'Ücretsiz'}</span>
          </div>

          <hr className="border-gray-200 mb-4" />
          
          <div className="flex justify-between mb-6 text-lg sm:text-xl font-bold text-gray-900">
            <span>Toplam</span>
            <span>{(cartTotal === 0 ? 0 : cartTotal + (neededForFreeShipping > 0 ? 49.9 : 0)).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</span>
          </div>

          {cartTotal > 0 && neededForFreeShipping > 0 && (
            <div className="mb-6 p-3 bg-red-50 text-risk-red-500 text-xs sm:text-sm font-semibold rounded-lg text-center border border-red-100">
              Ücretsiz kargo için sepetinize {neededForFreeShipping.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL daha ekleyin.
            </div>
          )}
          {cartTotal > 0 && neededForFreeShipping <= 0 && (
            <div className="mb-6 p-3 bg-green-50 text-badge-compatible text-xs sm:text-sm font-bold rounded-lg text-center border border-green-100">
              Ücretsiz Kargo Kazandınız 🎉
            </div>
          )}

          <button 
            disabled={cartTotal === 0}
            className={`w-full py-3 sm:py-4 rounded-xl font-bold flex justify-center items-center transition-all duration-normal shadow-md
              ${cartTotal === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-cta-background hover:bg-cta-hover text-white hover:shadow-lg'}
            `}
            onClick={() => { if(cartTotal > 0) window.location.href = '/odeme' }}
          >
            Ödemeye Geç <ArrowRight size={18} className="ml-2" />
          </button>

          <div className="mt-4 flex items-center justify-center text-[10px] sm:text-xs text-gray-500">
            <ShieldCheck size={16} className="mr-1 text-badge-certified" /> 
            <span>256-bit SSL Güvenli Ödeme</span>
          </div>
        </div>
      </div>
    </div>
  )
}
