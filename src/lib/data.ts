import { prisma } from '@/lib/prisma'
import { unstable_cache } from 'next/cache'

export const getCategoryTree = unstable_cache(
  async () => {
    const categories = await prisma.category.findMany({
      include: {
        products: {
          select: { brand: true },
        }
      }
    })

    // Build a nested structure
    const tree = categories.map(cat => {
      const brandsSet = new Set<string>()
      
      cat.products.forEach(p => {
        if (p.brand) {
          brandsSet.add(p.brand)
        }
      })

      const brands = Array.from(brandsSet).map(brandName => ({
        name: brandName
      }))

      return { ...cat, brands }
    })

    return tree
  },
  ['category-tree'],
  { tags: ['category-tree'], revalidate: 3600 } // Cache for 1 hour or until manual revalidation
)
