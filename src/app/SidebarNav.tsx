'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronRight, ChevronDown } from 'lucide-react'

export function SidebarNav({ tree }: { tree: any[] }) {
  const [openCategory, setOpenCategory] = useState<string | null>(null)
  const [openBrand, setOpenBrand] = useState<string | null>(null)

  const toggleCategory = (slug: string) => {
    if (openCategory === slug) {
      setOpenCategory(null)
      setOpenBrand(null) // Close brands when closing category
    } else {
      setOpenCategory(slug)
      setOpenBrand(null) // Reset brand when changing category
    }
  }

  const toggleBrand = (brandName: string) => {
    if (openBrand === brandName) {
      setOpenBrand(null)
    } else {
      setOpenBrand(brandName)
    }
  }

  return (
    <div className="p-4">
      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Kategoriler</h3>
      <ul className="space-y-2">
        {tree.map(cat => (
          <li key={cat.id} className="group">
            <div className="flex items-center justify-between py-1">
              <Link 
                href={`/kategori/${cat.slug}`} 
                className="font-semibold text-gray-700 hover:text-trust-blue-600 flex-1"
                onClick={() => setOpenCategory(cat.slug)}
              >
                {cat.name}
              </Link>
              {cat.brands.length > 0 && (
                <button 
                  onClick={() => toggleCategory(cat.slug)} 
                  className="text-gray-400 hover:text-trust-blue-600 p-1"
                >
                  {openCategory === cat.slug ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </button>
              )}
            </div>
            
            {/* Brands (Only show if this category is open) */}
            {openCategory === cat.slug && cat.brands.length > 0 && (
              <ul className="pl-4 mt-1 border-l-2 border-gray-100 space-y-1">
                {cat.brands.map((brand: any) => (
                  <li key={brand.name}>
                    <div className="flex items-center justify-between">
                      <Link 
                        href={`/kategori/${cat.slug}?brand=${brand.name}`} 
                        className="text-sm text-gray-600 hover:text-trust-blue-600 flex-1 py-1"
                        onClick={() => setOpenBrand(brand.name)}
                      >
                        {brand.name}
                      </Link>
                      {brand.models.length > 0 && (
                        <button 
                          onClick={() => toggleBrand(brand.name)}
                          className="text-gray-400 hover:text-trust-blue-600 p-1"
                        >
                          {openBrand === brand.name ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>
                      )}
                    </div>
                    
                    {/* Models (Only show if this brand is open) */}
                    {openBrand === brand.name && brand.models.length > 0 && (
                      <ul className="pl-5 mt-1 space-y-1 mb-2">
                        {brand.models.map((model: string) => (
                          <li key={model}>
                            <Link 
                              href={`/kategori/${cat.slug}?brand=${brand.name}&model=${model}`} 
                              className="text-xs text-gray-500 hover:text-trust-blue-600 truncate block w-full py-0.5"
                            >
                              {model}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
        {tree.length === 0 && (
          <div className="text-xs text-gray-400">Kategori bulunamadı.</div>
        )}
      </ul>
    </div>
  )
}
