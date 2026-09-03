'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronRight, ChevronDown } from 'lucide-react'
import { usePathname, useSearchParams } from 'next/navigation'

export function SidebarNav({ tree, onNavigate }: { tree: any[], onNavigate?: () => void }) {
  const [openCategory, setOpenCategory] = useState<string | null>(null)
  const [openBrand, setOpenBrand] = useState<string | null>(null)
  
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeBrand = searchParams.get('brand')
  const activeModel = searchParams.get('model')

  // Auto open based on current URL
  useEffect(() => {
    const slugMatch = pathname.match(/\/kategori\/([^\/]+)/)
    if (slugMatch) {
      setOpenCategory(slugMatch[1])
    }
    if (activeBrand) {
      setOpenBrand(activeBrand)
    }
  }, [pathname, activeBrand])

  const toggleCategory = (slug: string) => {
    if (openCategory === slug) {
      setOpenCategory(null)
      setOpenBrand(null)
    } else {
      setOpenCategory(slug)
      setOpenBrand(null)
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
      <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-4">Kategoriler</h3>
      <ul className="space-y-2">
        {tree.map(cat => {
          const isCatActive = pathname === `/kategori/${cat.slug}` && !activeBrand && !activeModel
          return (
          <li key={cat.id} className="group">
            <div className="flex items-center justify-between py-1">
              <Link 
                href={`/kategori/${cat.slug}`} 
                className={`flex-1 transition-colors ${isCatActive ? 'font-bold text-trust-blue-600' : 'font-semibold text-neutral-900 hover:text-trust-blue-600'}`}
                onClick={() => {
                  setOpenCategory(cat.slug)
                  setOpenBrand(null)
                  if (onNavigate) onNavigate()
                }}
              >
                {cat.name}
              </Link>
              {cat.brands.length > 0 && (
                <button 
                  onClick={() => toggleCategory(cat.slug)} 
                  className="text-neutral-500 hover:text-trust-blue-600 p-1"
                >
                  {openCategory === cat.slug ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </button>
              )}
            </div>
            
            {openCategory === cat.slug && cat.brands.length > 0 && (
              <ul className="pl-4 mt-1 border-l-2 border-neutral-200 space-y-1">
                {cat.brands.map((brand: any) => {
                  const isBrandActive = pathname === `/kategori/${cat.slug}` && activeBrand === brand.name && !activeModel
                  return (
                  <li key={brand.name}>
                    <div className="flex items-center justify-between">
                      <Link 
                        href={`/kategori/${cat.slug}?brand=${brand.name}`} 
                        className={`flex-1 py-1 transition-colors ${isBrandActive ? 'font-bold text-trust-blue-600 text-sm' : 'text-sm text-neutral-500 hover:text-trust-blue-600'}`}
                        onClick={() => {
                          setOpenBrand(brand.name)
                          if (onNavigate) onNavigate()
                        }}
                      >
                        {brand.name}
                      </Link>
                    </div>
                  </li>
                )})}
              </ul>
            )}
          </li>
        )})}
        {tree.length === 0 && (
          <div className="text-xs text-neutral-500">Kategori bulunamadı.</div>
        )}
      </ul>
    </div>
  )
}
