import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { ProductCard } from '@/components/ProductCard'
import { ModelFilter } from '@/components/ModelFilter'
import { getCachedCategoryData } from '@/lib/data'
import { toTitleCase } from '@/lib/utils'
import type { Metadata } from 'next'

export const revalidate = 60; // ISR cache

const MAX_TITLE = 60
const MAX_DESC = 155

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const resolvedParams = await params
  const slug = decodeURIComponent(resolvedParams.slug)
  const data = await getCachedCategoryData(slug)

  if (!data) {
    return { title: 'Kategori Bulunamadı | Fodos' }
  }

  const name = toTitleCase(data.category.name)
  const pageTitle = `${name} | Fodos`.length <= MAX_TITLE ? `${name} | Fodos` : name.slice(0, MAX_TITLE - 1).trim() + '…'
  const desc = `${name} çeşitleri uygun fiyatlarla Fodos'ta. Orijinal, test edilmiş yedek parçalar, aynı gün kargo ve stoktan teslim.`
  const pageDescription = desc.length > MAX_DESC ? desc.slice(0, MAX_DESC - 1).trim() + '…' : desc

  return {
    title: pageTitle,
    description: pageDescription,
    alternates: {
      canonical: `https://www.fodos.com.tr/kategori/${slug}`,
    },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
    },
  }
}

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

  const data = await getCachedCategoryData(slug, brand, model)

  if (!data) {
    return notFound()
  }

  const { category, products, availableModels } = data

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">
          {toTitleCase(category.name)}
        </h1>
        {brand && (
          <p className="text-neutral-500">
            {toTitleCase(brand)} {model ? `> ${model}` : ''}
          </p>
        )}
        <p className="text-sm text-neutral-500 mt-1">{products.length} ürün bulundu.</p>
      </div>

      {brand && (
        <Suspense fallback={<div className="mb-8 p-4 text-sm text-neutral-500">Modeller yükleniyor...</div>}>
          <ModelFilter models={availableModels} activeModel={model} />
        </Suspense>
      )}

      {products.length === 0 ? (
        <div className="text-center py-20 bg-neutral-0 rounded-xl border border-neutral-200">
          <p className="text-neutral-500 text-lg">Bu kategoride şu an ürün bulunmamaktadır.</p>
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

