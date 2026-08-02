import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { AddToCart } from './AddToCart'
import { ShieldAlert, Info, ShieldCheck, Zap, AlertTriangle } from 'lucide-react'
import { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await prisma.product.findUnique({ where: { slug: params.slug } })
  if (!product) return { title: 'Ürün Bulunamadı' }
  return {
    title: `${product.title} | Fodos & Piaks`,
    description: product.description_html?.replace(/<[^>]*>?/gm, '').substring(0, 160) || product.title,
  }
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: { images: true, category: true }
  })

  if (!product) {
    notFound()
  }

  const hasDiscount = product.reference_price && product.reference_price > product.sale_price
  const discountPercent = hasDiscount 
    ? Math.round(((product.reference_price! - product.sale_price) / product.reference_price!) * 100)
    : 0

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-100 rounded-2xl border border-gray-200 flex items-center justify-center relative overflow-hidden">
            {product.images.length > 0 ? (
              <img src={product.images[0].url} alt={product.title} className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-400">[Ürün Görseli]</span>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <div className="mb-2 text-sm text-gray-500 uppercase tracking-wide font-semibold">
            {product.brand} | {product.model_code}
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-4">
            {product.title}
          </h1>

          {/* Pricing - Anchoring Effect */}
          <div className="mb-6 flex items-baseline space-x-4">
            <span className="text-4xl font-extrabold text-price-active">
              {product.sale_price.toLocaleString('tr-TR')} TL
            </span>
            {hasDiscount && (
              <>
                <span className="text-lg text-price-strikethrough line-through">
                  {product.reference_price!.toLocaleString('tr-TR')} TL
                </span>
                <span className="px-2 py-1 bg-trust-blue-100 text-trust-blue-600 rounded text-sm font-bold">
                  %{discountPercent} İndirim
                </span>
              </>
            )}
          </div>

          {/* Neuromarketing Loss Framing & Badges based on template_type */}
          <div className="space-y-4 mb-8">
            {product.category?.template_type === 'battery' && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-4 items-start">
                <ShieldCheck className="text-badge-certified flex-shrink-0" size={24} />
                <div>
                  <h4 className="font-bold text-trust-blue-600 mb-1">Termal Kaçak ve Yangın Koruması</h4>
                  <p className="text-sm text-gray-700">Sertifikasız bataryaların termal kaçak riskini cihazınıza taşımayın. Bu ürün, IEC 62133 ve UN 38.3 uluslararası güvenlik standartlarında test edilmiş NTC termistörlü BMS entegresine sahiptir.</p>
                </div>
              </div>
            )}

            {product.category?.template_type === 'charger' && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex gap-4 items-start">
                <ShieldAlert className="text-action-orange-600 flex-shrink-0" size={24} />
                <div>
                  <h4 className="font-bold text-action-orange-600 mb-1">Cihazınızı Anakart Yanmasından Koruyun</h4>
                  <p className="text-sm text-gray-700">Dengesiz voltajın cihazınızın şarj entegresine (IC) verdiği kalıcı hasarı durdurun. Orijinal akım korumalı devresiyle cihazınızı güvenle şarj edin.</p>
                </div>
              </div>
            )}

            {product.category?.template_type === 'case' && (
              <div className="bg-gray-100 border border-gray-200 rounded-xl p-4 flex gap-4 items-start">
                <Info className="text-gray-500 flex-shrink-0" size={24} />
                <div>
                  <h4 className="font-bold text-gray-700 mb-1">Ekranınızı Kırılmaktan Koruyun</h4>
                  <p className="text-sm text-gray-600">Darbe emici TPU/PC materyali sayesinde, cihazınızı tek bir düşüşte oluşabilecek binlerce liralık ekran masrafından koruyun.</p>
                </div>
              </div>
            )}
          </div>

          <hr className="border-gray-200" />

          {/* CTA & Model Verifier */}
          <AddToCart product={product} />

          {/* Frictionless Trust Indicators */}
          <div className="mt-6 flex flex-wrap gap-4 text-trust-micro text-gray-500">
            <div className="flex items-center"><ShieldCheck size={16} className="mr-1 text-badge-certified" /> 30 Gün İade Garantisi</div>
            <div className="flex items-center"><Zap size={16} className="mr-1 text-action-orange-500" /> Bugün 15:00'e kadar Aynı Gün Kargo</div>
          </div>
          
          {/* Trendyol Bridge */}
          {product.trendyol_url && (
            <div className="mt-8 pt-6 border-t border-gray-100">
              <a href={product.trendyol_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm text-gray-600 hover:text-trust-blue-600 transition-colors">
                <span className="w-6 h-6 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center font-bold mr-2 text-xs">T</span>
                Bu ürün Trendyol'da da satılıyor
              </a>
            </div>
          )}
        </div>
      </div>
      
      {/* Subnominal Comparison (for battery/protector) */}
      {(product.category?.template_type === 'battery' || product.category?.template_type === 'protector') && (
        <section className="mt-24">
          <h2 className="text-2xl font-bold text-center mb-12">Neden Fodos Orijinal Parçaları?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Bad Alternative - Subnominal */}
            <div className="relative p-8 rounded-2xl border border-gray-200 bg-subnominal-warning/30 backdrop-blur-sm">
              <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cracked-glass.png')] rounded-2xl pointer-events-none"></div>
              <h3 className="text-xl font-bold text-gray-500 mb-4 flex items-center"><AlertTriangle className="mr-2" /> Fason / Standart Dışı Parça</h3>
              <ul className="space-y-3 text-gray-500">
                <li>❌ Isınma ve anakart hasarı riski</li>
                <li>❌ Düşük voltaj kapasitesi</li>
                <li>❌ Satış sonrası destek yok</li>
              </ul>
            </div>
            
            {/* Premium Alternative */}
            <div className="p-8 rounded-2xl border-2 border-trust-blue-500 bg-white shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-trust-blue-500 text-white px-4 py-1 rounded-bl-lg text-sm font-bold">
                Bizim Ürünümüz
              </div>
              <h3 className="text-xl font-bold text-trust-blue-600 mb-4 flex items-center"><ShieldCheck className="mr-2" /> Sertifikalı Premium Parça</h3>
              <ul className="space-y-3 text-gray-800 font-medium">
                <li>✅ Güvenlik sertifikalı ve test edilmiş</li>
                <li>✅ Orijinal kapasite ve akım koruması</li>
                <li>✅ 1 Yıl birebir değişim garantisi</li>
                <li>✅ Mühendislik harikası kusursuz uyum</li>
              </ul>
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
