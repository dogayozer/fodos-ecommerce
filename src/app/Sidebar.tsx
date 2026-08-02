import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export async function Sidebar() {
  // Aggregate categories, and within them, brands.
  // Since Prisma SQLite doesn't support distinct well with nested grouping, 
  // we'll fetch categories, then group products by brand/model.
  // For performance, we limit or simplify. 
  // A standard approach: just fetch categories, then a few top brands.
  
  const categories = await prisma.category.findMany({
    include: {
      products: {
        select: { brand: true, model_code: true },
        where: { status: { not: 'inactive' } },
      }
    }
  })

  // Build a nested structure in JS
  const tree = categories.map(cat => {
    const brandsMap = new Map<string, Set<string>>()
    
    cat.products.forEach(p => {
      if (p.brand) {
        if (!brandsMap.has(p.brand)) brandsMap.set(p.brand, new Set())
        if (p.model_code) brandsMap.get(p.brand)!.add(p.model_code)
      }
    })

    const brands = Array.from(brandsMap.entries()).map(([brandName, modelsSet]) => ({
      name: brandName,
      models: Array.from(modelsSet).slice(0, 5) // Limit models to prevent huge UI
    }))

    return { ...cat, brands }
  })

  return (
    <aside className="w-64 flex-shrink-0 border-r border-gray-200 bg-white min-h-screen hidden md:block overflow-y-auto sticky top-16" style={{ height: 'calc(100vh - 4rem)' }}>
      <div className="p-4">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Kategoriler</h3>
        <ul className="space-y-2">
          {tree.map(cat => (
            <li key={cat.id} className="group">
              <Link href={`/kategori/${cat.slug}`} className="font-semibold text-gray-700 hover:text-trust-blue-600 block py-1">
                {cat.name}
              </Link>
              
              {/* Brands */}
              {cat.brands.length > 0 && (
                <ul className="pl-4 mt-1 border-l-2 border-gray-100 space-y-1">
                  {cat.brands.map(brand => (
                    <li key={brand.name}>
                      <Link href={`/kategori/${cat.slug}?brand=${brand.name}`} className="text-sm text-gray-600 hover:text-trust-blue-600 flex items-center">
                        <ChevronRight size={14} className="mr-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                        {brand.name}
                      </Link>
                      
                      {/* Models */}
                      {brand.models.length > 0 && (
                        <ul className="pl-5 mt-1 space-y-1">
                          {brand.models.map(model => (
                            <li key={model}>
                              <Link href={`/kategori/${cat.slug}?brand=${brand.name}&model=${model}`} className="text-xs text-gray-500 hover:text-trust-blue-600 truncate block w-full">
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
    </aside>
  )
}
