import { prisma } from '@/lib/prisma'
import { unstable_cache } from 'next/cache'

export const getCategoryTree = unstable_cache(
  async () => {
    const categories = await prisma.category.findMany({
      include: {
        products: {
          select: { brand: true, title: true },
        }
      }
    })

    // Build a nested structure
    const tree = categories.map(cat => {
      const brandsMap = new Map<string, Set<string>>()
      
      cat.products.forEach(p => {
        if (p.brand) {
          if (!brandsMap.has(p.brand)) brandsMap.set(p.brand, new Set())
          if (p.title) brandsMap.get(p.brand)!.add(p.title)
        }
      })

      const brands = Array.from(brandsMap.entries()).map(([brandName, modelsSet]) => ({
        name: brandName,
        models: Array.from(modelsSet) // Tüm modelleri göster
      }))

      return { ...cat, brands }
    })

    return tree
  },
  ['category-tree'],
  { tags: ['category-tree'], revalidate: 3600 } // Cache for 1 hour or until manual revalidation
)
