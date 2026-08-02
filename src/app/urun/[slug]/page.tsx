import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { AddToCart } from './AddToCart'
import { ProductGallery } from './ProductGallery'
import { ShieldAlert, Info, ShieldCheck, Zap, AlertTriangle, Star } from 'lucide-react'
import { Metadata } from 'next'

export const revalidate = 60

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params
  const slug = decodeURIComponent(resolvedParams.slug)
  const product = await prisma.product.findUnique({ where: { slug } })
  if (!product) return { title: 'Ürün Bulunamadı' }
  return {
    title: `${product.title} | Fodos & Piaks`,
    description: product.description_raw?.substring(0, 160) || product.title,
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params
  const slug = decodeURIComponent(resolvedParams.slug)
  
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { images: { orderBy: { order: 'asc' } }, category: true }
  })

  if (!product) {
    notFound()
  }

  const hasDiscount = product.reference_price && product.reference_price > product.sale_price
  const discountPercent = hasDiscount 
    ? Math.round(((product.reference_price! - product.sale_price) / product.reference_price!) * 100)
    : 0

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Left Side: Images Gallery */}
        <div className="w-full lg:w-1/2 flex flex-col">
          <ProductGallery images={product.images} alt={product.title} />
          
          {/* Trust Indicators (Moved below images) */}
          <div className="mt-6 flex flex-col sm:flex-row flex-wrap gap-4 text-sm sm:text-base font-bold text-gray-700 bg-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center flex-1">
              <ShieldCheck size={24} className="mr-2 text-badge-certified flex-shrink-0" /> 
              15 Gün İade Garantisi
            </div>
            <div className="flex items-center flex-1 bg-red-600 text-white p-3 rounded-xl shadow-md">
              <Zap size={24} className="mr-2 text-yellow-300 flex-shrink-0" /> 
              <span>
                Aynı Gün Kargo - <span className="animate-pulse text-white font-extrabold drop-shadow-md">Hızlı Teslimat</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Product Info */}
        <div className="w-full lg:w-1/2 flex flex-col">
          <div className="mb-2 text-sm text-gray-500 uppercase tracking-wide font-semibold">
            {product.brand} | {product.model_code}
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-2">
            {product.title}
          </h1>

          {/* 5 Stars rating block */}
          <div className="flex items-center space-x-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={18} className="fill-action-orange-500 text-action-orange-500" />
            ))}
            <span className="text-sm text-gray-500 ml-2">(14 Değerlendirme)</span>
          </div>

          {/* Pricing */}
          <div className="mb-8 p-6 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col">
            {hasDiscount && (
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-lg text-price-strikethrough line-through">
                  {Number(product.reference_price).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL
                </span>
                <span className="px-2 py-1 bg-trust-blue-100 text-trust-blue-600 rounded text-xs font-bold uppercase tracking-wider">
                  Web'e Özel %{discountPercent} İndirim
                </span>
              </div>
            )}
            <div className="text-4xl font-extrabold text-action-orange-600">
              {Number(product.sale_price).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL
            </div>
            <div className="text-xs text-gray-400 mt-2">KDV Dahildir</div>
          </div>

          {/* Trust Badges based on template_type */}
          <div className="space-y-4 mb-6">
            {product.category?.template_type === 'battery' && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-4 items-start">
                <ShieldCheck className="text-badge-certified flex-shrink-0" size={24} />
                <div>
                  <h4 className="font-bold text-trust-blue-600 mb-1">Termal Kaçak ve Yangın Koruması</h4>
                  <p className="text-xs text-gray-700">Sertifikasız bataryaların termal kaçak riskini cihazınıza taşımayın. Bu ürün uluslararası güvenlik standartlarında test edilmiştir.</p>
                </div>
              </div>
            )}
          </div>

          <hr className="border-gray-200" />

          {/* Add To Cart Component */}
          <AddToCart product={product} />


          {/* Trendyol Bridge */}
          {product.trendyol_url && (
            <div className="mt-6 pt-4 text-center">
              <a href={product.trendyol_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm font-semibold text-gray-600 hover:text-orange-500 transition-colors">
                <span className="w-6 h-6 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center font-bold mr-2 text-xs">T</span>
                Trendyol'da Görüntüle
              </a>
            </div>
          )}
        </div>
      </div>
      
      {/* Product Description Section */}
      <div className="mt-16 pt-12 border-t border-gray-200 max-w-4xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Ürün Açıklaması</h2>
        <div className="prose prose-blue max-w-none text-gray-700">
          {product.description_raw ? (
            <div dangerouslySetInnerHTML={{ __html: product.description_raw.replace(/\n/g, '<br/>') }} />
          ) : (
            <p>Bu ürün için henüz detaylı bir açıklama girilmemiştir.</p>
          )}
        </div>
      </div>

    </main>
  )
}
