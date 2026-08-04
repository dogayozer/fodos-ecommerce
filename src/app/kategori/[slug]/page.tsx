import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { ProductCard } from '@/components/ProductCard'
import { ModelFilter } from '@/components/ModelFilter'

export const revalidate = 60; // ISR cache

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  
  // URL decode since Turkish characters might be URL encoded
  const slug = decodeURIComponent(resolvedParams.slug)
  const brand = typeof resolvedSearchParams.brand === 'string' ? resolvedSearchParams.brand : undefined
  const model = typeof resolvedSearchParams.model === 'string' ? resolvedSearchParams.model : undefined

  // Find the category
  const category = await prisma.category.findUnique({
    where: { slug }
  })

  if (!category) {
    return notFound()
  }

  // Build the filter
  const whereClause: any = {
    categoryId: category.id
  }

  if (brand) whereClause.brand = brand
  if (model) whereClause.model_code = model

  // Fetch products
  const products = await prisma.product.findMany({
    where: whereClause,
    include: { images: true },
    orderBy: { createdAt: 'desc' }
  })

  // Fetch available models if brand is selected
  let availableModels: string[] = []
  if (brand) {
    const modelsResult = await prisma.product.findMany({
      where: { categoryId: category.id, brand: brand },
      select: { model_code: true },
      distinct: ['model_code']
    })
    availableModels = modelsResult.map(p => p.model_code).filter(Boolean) as string[]
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {category.name}
        </h1>
        {brand && (
          <p className="text-gray-500">
            {brand} {model ? `> ${model}` : ''}
          </p>
        )}
        <p className="text-sm text-gray-400 mt-1">{products.length} ürün bulundu.</p>
      </div>

      {brand && (
        <Suspense fallback={<div className="mb-8 p-4 text-sm text-gray-500">Modeller yükleniyor...</div>}>
          <ModelFilter models={availableModels} activeModel={model} />
        </Suspense>
      )}

      {products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
          <p className="text-gray-500 text-lg">Bu kategoride şu an ürün bulunmamaktadır.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}

