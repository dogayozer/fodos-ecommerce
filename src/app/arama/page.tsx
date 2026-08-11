import { prisma } from '@/lib/prisma'
import { ProductCard } from '@/components/ProductCard'

export const dynamic = 'force-dynamic'

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams
  const query = typeof resolvedSearchParams.q === 'string' ? resolvedSearchParams.q : ''
  const categorySlug = typeof resolvedSearchParams.category === 'string' ? resolvedSearchParams.category : null
  const searchTerms = query.toLowerCase().split(' ').filter(Boolean)

  let products: any[] = []
  let categoryName = ''

  if (categorySlug) {
    const category = await prisma.category.findUnique({
      where: { slug: categorySlug }
    })
    if (category) categoryName = category.name
  }

  if (searchTerms.length > 0) {
    const whereClause: any = {
      AND: searchTerms.map(term => ({
        OR: [
          { title: { contains: term, mode: 'insensitive' } },
          { brand: { contains: term, mode: 'insensitive' } },
          { model_code: { contains: term, mode: 'insensitive' } },
          { compatible_models: { contains: term, mode: 'insensitive' } },
          { barcode: { contains: term, mode: 'insensitive' } },
          { description_raw: { contains: term, mode: 'insensitive' } }
        ]
      }))
    }
    
    if (categorySlug) {
      whereClause.category = {
        slug: categorySlug
      }
    }

    products = await prisma.product.findMany({
      where: whereClause,
      include: { images: true },
      orderBy: { createdAt: 'desc' }
    })
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Arama Sonuçları
        </h1>
        {query ? (
          <p className="text-gray-500">
            {categoryName && <span className="font-semibold text-gray-900 mr-1">{categoryName} kategorisinde</span>}
            <span className="font-semibold text-trust-blue-600">"{query}"</span> için {products.length} ürün bulundu.
          </p>
        ) : (
          <p className="text-gray-500">Lütfen aramak istediğiniz ürünü yazın.</p>
        )}
      </div>

      {query && products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-100 flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">🔍</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Ürün Bulunamadı</h2>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            "{query}" aramasıyla eşleşen bir ürün bulamadık. Farklı kelimelerle veya kategori menüsünü kullanarak tekrar deneyebilirsiniz.
          </p>
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
