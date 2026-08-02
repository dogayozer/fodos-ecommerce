import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { prisma } from '@/lib/prisma'

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
    categoryId: category.id,
    status: { not: 'inactive' }
  }

  if (brand) whereClause.brand = brand
  if (model) whereClause.model_code = model

  // Fetch products
  const products = await prisma.product.findMany({
    where: whereClause,
    include: { images: true },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {category.name}
        </h1>
        {brand && (
          <p className="text-gray-500">
            Filtre: {brand} {model ? `> ${model}` : ''}
          </p>
        )}
        <p className="text-sm text-gray-400 mt-1">{products.length} ürün bulundu.</p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
          <p className="text-gray-500 text-lg">Bu kategoride şu an ürün bulunmamaktadır.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}

function ProductCard({ product }: { product: any }) {
  const hasDiscount = product.reference_price && product.reference_price > product.sale_price
  
  return (
    <Link href={`/urun/${product.slug}`} className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-normal overflow-hidden flex flex-col h-full relative">
      {hasDiscount && (
        <div className="absolute top-3 left-3 bg-action-orange-500 text-white text-xs font-bold px-2 py-1 rounded-md z-10">
          İndirim
        </div>
      )}
      <div className="aspect-square bg-gray-50 flex items-center justify-center p-4 relative overflow-hidden">
        {product.images && product.images.length > 0 ? (
          <img src={product.images[0].url} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-normal mix-blend-multiply" />
        ) : (
          <span className="text-gray-300 text-sm">Görsel Yok</span>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <div className="text-xs text-gray-400 mb-1">{product.brand}</div>
        <h3 className="text-sm font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-trust-blue-600 transition-colors">{product.title}</h3>
        
        <div className="mt-auto flex items-end justify-between pt-4">
          <div>
            {hasDiscount ? (
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 line-through">{product.reference_price} TL</span>
                <span className="text-lg font-bold text-action-orange-600">{product.sale_price} TL</span>
              </div>
            ) : (
              <span className="text-lg font-bold text-gray-900">{product.sale_price} TL</span>
            )}
          </div>
          <button className="w-10 h-10 rounded-full bg-trust-blue-50 text-trust-blue-600 flex items-center justify-center group-hover:bg-trust-blue-600 group-hover:text-white transition-colors">
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </Link>
  )
}
