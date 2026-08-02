import { prisma } from '@/lib/prisma'

export async function getCategoryTree() {
  const categories = await prisma.category.findMany({
    include: {
      products: {
        select: { brand: true, model_code: true },
      }
    }
  })

  // Build a nested structure
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

  return tree
}
