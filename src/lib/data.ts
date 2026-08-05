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

export const getCachedCategoryData = unstable_cache(
  async (slug: string, brand?: string, model?: string) => {
    const category = await prisma.category.findUnique({
      where: { slug }
    })
    
    if (!category) return null

    const whereClause: any = { categoryId: category.id }
    if (brand) whereClause.brand = brand
    if (model) whereClause.model_code = model

    const products = await prisma.product.findMany({
      where: whereClause,
      include: { images: true },
      orderBy: { createdAt: 'desc' }
    })

    let availableModels: string[] = []
    if (brand) {
      const modelsResult = await prisma.product.findMany({
        where: { categoryId: category.id, brand: brand },
        select: { model_code: true },
        distinct: ['model_code']
      })
      availableModels = modelsResult.map(p => p.model_code).filter(Boolean) as string[]
    }

    return { category, products, availableModels }
  },
  ['category-products'],
  { tags: ['products-data'], revalidate: 3600 }
)
