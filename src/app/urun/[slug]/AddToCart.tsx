'use client'

import { useState } from 'react'
import { CheckCircle, AlertTriangle } from 'lucide-react'

export function AddToCart({ product }: { product: any }) {
  const isCaseOrKeypad = product.category?.template_type === 'case' || product.category?.template_type === 'keypad'
  
  // Fake models for the dropdown (in reality, extracted from compatible_models JSON)
  const models = ['iPhone 13', 'iPhone 14', 'iPhone 14 Pro', 'iPhone 15']
  
  const [selectedModel, setSelectedModel] = useState('')
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    if (isCaseOrKeypad && !selectedModel) return
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const disabled = isCaseOrKeypad && !selectedModel

  return (
    <div className="mt-8">
      {isCaseOrKeypad && (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-xl">
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            <span className="text-risk-red-500 mr-1">*</span> 
            Telefon Modelinizi Seçin
          </label>
          <p className="text-xs text-gray-500 mb-3">Yanlış parça siparişi, onarım sürecinizi aksatır. Lütfen tam modelinizi doğrulayın.</p>
          
          <select 
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-trust-blue-500 focus:border-trust-blue-500"
          >
            <option value="">Seçiniz...</option>
            {models.map(m => <option key={m} value={m}>{m}</option>)}
          </select>

          {selectedModel && (
            <div className="mt-3 flex items-center text-badge-compatible text-sm font-semibold animate-in fade-in slide-in-from-top-2">
              <CheckCircle size={16} className="mr-1" />
              Bu ürün {selectedModel} ile uyumlu.
            </div>
          )}
        </div>
      )}

      {product.stock_qty <= 10 && product.stock_qty > 0 && (
        <div className="flex items-center text-action-orange-600 text-sm font-bold mb-3">
          <AlertTriangle size={16} className="mr-1" />
          Son {product.stock_qty} adet!
        </div>
      )}

      <button
        onClick={handleAdd}
        disabled={disabled}
        className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center transition-all duration-normal
          ${disabled 
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-70' 
            : added 
              ? 'bg-badge-compatible text-white shadow-lg'
              : 'bg-cta-background hover:bg-cta-hover text-white shadow-md hover:shadow-xl'
          }
        `}
        title={disabled ? 'Önce telefon modelinizi seçin' : ''}
      >
        {added ? (
          <>
            <CheckCircle className="mr-2" /> Sepete Eklendi
          </>
        ) : (
          'Sepete Ekle'
        )}
      </button>

      {disabled && (
        <p className="text-center text-xs text-gray-500 mt-2">Sepete eklemek için model seçimi zorunludur.</p>
      )}
    </div>
  )
}
