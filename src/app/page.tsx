import Link from 'next/link'
import { ShieldCheck, Zap, Wrench, ArrowRight, ShoppingCart } from 'lucide-react'
import { prisma } from '@/lib/prisma'

export const revalidate = 60; // 60 saniyede bir sayfayı yenile

export default async function HomePage() {
  // Fetch New Arrivals (Yeni Gelenler)
  const newArrivals = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    take: 4,
    include: { images: true }
  })

  // Mock Best Sellers (Çok Satanlar)
  const bestSellers = await prisma.product.findMany({
    orderBy: { stock_qty: 'desc' }, 
    take: 4,
    include: { images: true }
  })

  // Fetch products to display random images at the top
  const randomProducts = await prisma.product.findMany({
    where: { 
      images: { some: {} }
    },
    include: { images: true },
    take: 50 // Fetch up to 50 to shuffle
  })

  // Shuffle and pick 12 images
  const randomImages = randomProducts
    .map(p => ({ url: p.images[0]?.url, title: p.title, slug: p.slug }))
    .filter(p => p.url)
    .sort(() => 0.5 - Math.random())
    .slice(0, 12)

  return (
    <main className="flex-1 flex flex-col w-full overflow-hidden">
      
      {/* Random Products Marquee (Top) */}
      {randomImages.length > 0 && (
        <div className="w-full bg-white border-b border-gray-100 py-3 overflow-hidden flex flex-col justify-center">
          <div className="flex space-x-4 animate-marquee-infinite min-w-max hover:animation-paused">
            {/* Double the array to make the infinite scroll smooth */}
            {[...randomImages, ...randomImages].map((img, idx) => (
              <Link 
                key={idx} 
                href={`/urun/${img.slug}`}
                className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 flex-shrink-0 bg-gray-50 rounded-xl border border-gray-100 p-2 block hover:border-trust-blue-500 transition-colors"
                title={img.title}
              >
                <img 
                  src={img.url} 
                  alt={img.title} 
                  className="w-full h-full object-contain mix-blend-multiply" 
                />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Hero Section - Z-Pattern */}
      <section className="bg-trust-blue-500 text-white py-12 md:py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
        <div className="px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center">
          
          <div className="md:w-1/2 space-y-6">
            <div className="inline-flex items-center space-x-2 bg-trust-blue-600 px-3 py-1 rounded-full text-xs font-semibold tracking-wider">
              <Wrench size={14} />
              <span>ONARIM HAKKINIZI DESTEKLİYORUZ</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Cihazınızı Çöpe Atmayın.
              <span className="block text-trust-blue-100 mt-2">Güvenle Yenileyin.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-trust-blue-50 max-w-lg leading-relaxed">
              Yan sanayi parçaların neden olduğu termal kaçak ve anakart hasarı risklerinden korunun. 
              Sertifikalı parçalarla cihazınızın ömrünü uzatın.
            </p>
            
            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <Link 
                href="/kategori/telefon-kasasi"
                className="inline-flex justify-center items-center px-8 py-4 bg-cta-background hover:bg-cta-hover text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-fast"
              >
                Uyumlu Parçaları Bul
                <ArrowRight className="ml-2" size={20} />
              </Link>
            </div>
          </div>

          <div className="md:w-1/2 mt-12 md:mt-0 relative hidden sm:block">
            <div className="aspect-video max-w-md mx-auto relative">
              <div className="absolute inset-0 rounded-3xl shadow-2xl overflow-hidden border-4 border-trust-blue-400/30 flex items-center justify-center bg-gray-100">
                <img 
                  src="/hero_gaze_cueing.jpg" 
                  alt="Güvenilir Telefon Tamiri" 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="absolute -bottom-6 -left-6 bg-white p-3 rounded-xl shadow-xl flex items-center space-x-3 border border-gray-100">
                <ShieldCheck className="text-badge-certified" size={24} />
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase">Güvenlik</p>
                  <p className="text-sm font-bold text-gray-900">Sertifikalı</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Brand Logos - Niche Section */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Yetkili Satış Noktası</p>
          <div className="max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-sm border border-gray-100 aspect-[4/1]">
            <img 
              src="/brands_banner.jpg" 
              alt="Fodos ve Piaks Markaları" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Best Sellers (Çok Satanlar) */}
      <section className="py-16 bg-gray-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-4 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Çok Satanlar</h2>
            <Link href="/cok-satanlar" className="text-xs sm:text-sm font-semibold text-trust-blue-600 hover:underline">Tümünü Gör</Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {bestSellers.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
            {bestSellers.length === 0 && <p className="text-gray-500 col-span-2">Henüz çok satan ürün bulunmuyor.</p>}
          </div>
        </div>
      </section>

      {/* New Arrivals (Yeni Gelenler) */}
      <section className="py-16 bg-white">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-4 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Yeni Gelenler</h2>
            <Link href="/yeni-gelenler" className="text-xs sm:text-sm font-semibold text-trust-blue-600 hover:underline">Tümünü Gör</Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {newArrivals.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
            {newArrivals.length === 0 && <p className="text-gray-500 col-span-2">Henüz yeni ürün bulunmuyor.</p>}
          </div>
        </div>
      </section>
      
    </main>
  )
}

function ProductCard({ product }: { product: any }) {
  const hasDiscount = product.reference_price && product.reference_price > product.sale_price
  
  return (
    <Link href={`/urun/${product.slug}`} className="group bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-normal overflow-hidden flex flex-col h-full relative">
      {hasDiscount && (
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-action-orange-500 text-white text-[9px] sm:text-xs font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded z-10 shadow-sm whitespace-nowrap">
          Web %40 İndirim
        </div>
      )}
      <div className="aspect-square bg-gray-50 flex items-center justify-center p-2 sm:p-4 relative overflow-hidden">
        {product.images && product.images.length > 0 ? (
          <img src={product.images[0].url} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-normal mix-blend-multiply" />
        ) : (
          <span className="text-gray-300 text-xs sm:text-sm">Görsel Yok</span>
        )}
      </div>
      <div className="p-2 sm:p-4 flex-1 flex flex-col">
        <div className="text-[10px] sm:text-xs text-gray-400 mb-1 line-clamp-1">{product.brand}</div>
        <h3 className="text-xs sm:text-sm font-semibold text-gray-800 mb-1 sm:mb-2 line-clamp-2 group-hover:text-trust-blue-600 transition-colors leading-tight">{product.title}</h3>
        
        <div className="mt-auto flex items-end justify-between pt-2 sm:pt-4">
          <div>
            {hasDiscount ? (
              <div className="flex flex-col">
                <span className="text-[10px] sm:text-xs text-gray-400 line-through">{Number(product.reference_price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</span>
                <span className="text-sm sm:text-lg font-bold text-action-orange-600">{Number(product.sale_price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</span>
              </div>
            ) : (
              <span className="text-sm sm:text-lg font-bold text-gray-900">{Number(product.sale_price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</span>
            )}
          </div>
          <button className="w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-trust-blue-50 text-trust-blue-600 flex items-center justify-center group-hover:bg-trust-blue-600 group-hover:text-white transition-colors">
            <ShoppingCart size={14} className="sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </Link>
  )
}
