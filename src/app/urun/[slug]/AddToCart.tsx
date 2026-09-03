'use client'

import { useState } from 'react'
import { CheckCircle, AlertTriangle } from 'lucide-react'

export function AddToCart({ product }: { product: any }) {
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    // Read from localStorage
    const existingCartStr = localStorage.getItem('cart')
    const cart = existingCartStr ? JSON.parse(existingCartStr) : []
    
    // Check if item exists
    const existingItemIndex = cart.findIndex((item: any) => item.id === product.id)
    if (existingItemIndex > -1) {
      cart[existingItemIndex].qty += 1
    } else {
      cart.push({ 
        id: product.id, 
        title: product.title,
        slug: product.slug,
        price: product.sale_price,
        image: product.images?.[0]?.url || '',
        qty: 1
      })
    }

    // Save back to localStorage
    localStorage.setItem('cart', JSON.stringify(cart))
    
    // Dispatch event so Header can update
    window.dispatchEvent(new Event('cartUpdated'))

    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="mt-8">
      {product.stock_qty <= 10 && product.stock_qty > 0 && (
        <div className="flex items-center text-action-orange-600 text-sm font-bold mb-3">
          <AlertTriangle size={16} className="mr-1" />
          Son {product.stock_qty} adet!
        </div>
      )}

      <button
        onClick={handleAdd}
        className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center transition-all duration-normal
          ${added
              ? 'bg-badge-compatible text-white shadow-[var(--shadow-card-hover)]'
              : 'bg-cta-background hover:bg-cta-hover text-white shadow-[var(--shadow-button)] hover:shadow-[var(--shadow-card-hover)]'
          }
        `}
      >
        {added ? (
          <>
            <CheckCircle className="mr-2" /> Sepete Eklendi
          </>
        ) : (
          'Sepete Ekle'
        )}
      </button>
    </div>
  )
}
