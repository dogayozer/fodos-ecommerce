import Link from 'next/link'
import Image from 'next/image'
import { ShieldCheck, Zap, Wrench, ArrowRight } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { ProductCard } from '@/components/ProductCard'
import { HomeSearchForm } from '@/components/HomeSearchForm'
import { RotatingHeroText } from '@/components/RotatingHeroText'

export const revalidate = 300; // 5 dakikada bir sayfayı yenile — vitrin galerisindeki rastgele
// dış CDN görsellerinin Next.js önbelleğinde daha uzun kalması için (60sn'de bir değişince her
// yenilemede yeni görseller cold-cache'e düşüyor, özellikle mobilde yükleme gecikmesine yol açıyordu)

export default async function HomePage() {
  // Fetch New Arrivals (Yeni Gelenler)
  const newArrivals = await prisma.product.findMany({
    where: { status: { not: 'inactive' } },
    orderBy: [
      { has_real_photo: 'desc' },
      { createdAt: 'desc' }
    ],
    take: 4,
    include: { images: true }
  })

  // Mock Best Sellers (Çok Satanlar)
  const bestSellers = await prisma.product.findMany({
    where: { status: { not: 'inactive' } },
    orderBy: [
      { has_real_photo: 'desc' },
      { stock_qty: 'desc' }
    ],
    take: 4,
    include: { images: true }
  })

  // Fetch products to display random images at the top
  const randomProducts = await prisma.product.findMany({
    where: {
      status: { not: 'inactive' }, // pasife alınan ürünler (ve harici/güvenilmez görsel domain'leri) vitrine hiç girmesin
      has_real_photo: true, // Trendyol import placeholder'ı değil, gerçek/benzersiz fotoğrafı olan ürünler
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
                <div className="relative w-full h-full">
                  <Image
                    src={img.url}
                    alt={img.title}
                    fill
                    sizes="120px"
                    priority={idx < 4}
                    className="object-contain mix-blend-multiply"
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Mobile Text Marquee (Only on mobile) */}
      <div className="md:hidden overflow-hidden bg-gradient-to-r from-trust-blue-500 to-trust-blue-600 text-white shadow-sm py-2 relative flex items-center h-10 border-b border-trust-blue-600">
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes text-slide {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .text-marquee-inner {
            display: flex;
            width: max-content;
            animation: text-slide 25s linear infinite;
            white-space: nowrap;
          }
        `}} />
        <div className="text-marquee-inner">
          <span className="text-xs font-bold px-4 tracking-wide whitespace-nowrap flex items-center">
            Istanbul- Sirkeci'deyiz • Stoktan Teslim Aynı Gün Kargo • Toptan Fiyatlar • Kaliteli Ürünler • Web Sitemizde Olmayan Ürünler İçin Arayınız • Telefon Tamircilerine Özel Fiyatlar
          </span>
          <span className="text-xs font-bold px-4 tracking-wide whitespace-nowrap flex items-center">
            Istanbul- Sirkeci'deyiz • Stoktan Teslim Aynı Gün Kargo • Toptan Fiyatlar • Kaliteli Ürünler • Web Sitemizde Olmayan Ürünler İçin Arayınız • Telefon Tamircilerine Özel Fiyatlar
          </span>
        </div>
      </div>

      {/* Hero Section - Z-Pattern */}
      <section className="bg-trust-blue-500 text-white py-12 md:py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
        <div className="px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center">
          
          <div className="md:w-1/2 space-y-6">
            <div className="inline-flex items-center space-x-2 bg-trust-blue-600 px-3 py-1 rounded-full text-xs font-semibold tracking-wider mb-2">
              <Wrench size={14} />
              <span>ONARIM HAKKINIZI DESTEKLİYORUZ</span>
            </div>
            
            <RotatingHeroText />
            
            <div className="pt-2 w-full">
              <HomeSearchForm />
            </div>
          </div>

          <div className="md:w-1/2 mt-12 md:mt-0 relative hidden sm:block">
            <div className="aspect-video max-w-md mx-auto relative">
              <div className="absolute inset-0 rounded-3xl shadow-2xl overflow-hidden border-4 border-trust-blue-400/30 flex items-center justify-center bg-gray-100">
                <Image 
                  src="/hero_gaze_cueing.jpg" 
                  alt="Güvenilir Telefon Tamiri" 
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
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

