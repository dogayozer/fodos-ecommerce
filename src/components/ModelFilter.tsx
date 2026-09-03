'use client'

import { useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'

export function ModelFilter({ models, activeModel }: { models: string[], activeModel?: string }) {
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const filteredModels = models.filter(m => m.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleSelectModel = (model: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (model) {
      params.set('model', model)
    } else {
      params.delete('model')
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  if (models.length === 0) return null

  return (
    <div className="mb-8 bg-neutral-0 p-4 rounded-xl shadow-[var(--shadow-card)] border border-neutral-200">
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-neutral-500" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-3 border border-neutral-200 rounded-lg focus:ring-trust-blue-500 focus:border-trust-blue-500 sm:text-sm bg-neutral-50"
          placeholder="Filtreleme için model ismi yazınız..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-500 hover:text-neutral-900"
            onClick={() => setSearchTerm('')}
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1 scrollbar-thin">
        {activeModel && (
          <button
            onClick={() => handleSelectModel(null)}
            className="px-3 py-1.5 text-sm rounded-full bg-trust-blue-100 text-trust-blue-700 font-medium hover:bg-trust-blue-200 transition-colors flex items-center gap-1 border border-trust-blue-200"
          >
            Tüm Modelleri Göster (Filtreyi Temizle)
          </button>
        )}
        
        {filteredModels.map(model => (
          <button
            key={model}
            onClick={() => handleSelectModel(model)}
            className={`px-3 py-1.5 text-sm rounded-full transition-colors border ${
              activeModel === model
                ? 'bg-trust-blue-600 text-white border-trust-blue-600'
                : 'bg-neutral-0 text-neutral-900 border-neutral-200 hover:border-trust-blue-300 hover:bg-trust-blue-50'
            }`}
          >
            {model}
          </button>
        ))}
        {filteredModels.length === 0 && (
          <p className="text-sm text-neutral-500 w-full text-center py-4">Aradığınız model bulunamadı.</p>
        )}
      </div>
    </div>
  )
}
