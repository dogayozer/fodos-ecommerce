import { prisma } from '@/lib/prisma'
import { unstable_cache } from 'next/cache'
import { toTitleCase } from './utils'

export const getCategoryTree = unstable_cache(
  async () => {
    const categories = await prisma.category.findMany({
      where: {
        products: {
          some: { status: 'active' }
        }
      },
      include: {
        products: {
          where: { status: 'active' },
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
        name: toTitleCase(brandName)
      }))

      return { ...cat, name: toTitleCase(cat.name), brands }
    })

    return tree
  },
  ['category-tree'],
  { tags: ['category-tree'], revalidate: 3600 } // Cache for 1 hour or until manual revalidation
)
