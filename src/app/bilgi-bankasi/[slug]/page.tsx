import { getFaqBySlug, getAllFaqs } from '@/lib/markdown'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Info } from 'lucide-react'

// Sadece önceden üretilmiş statik yolları (slug) derleme anında oluştur
export async function generateStaticParams() {
  const faqs = await getAllFaqs()
  return faqs.map((faq) => ({
    slug: faq.slug,
  }))
}

// Arama motorları için dinamik SEO başlıkları
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params
  const faq = await getFaqBySlug(resolvedParams.slug)
  
  if (!faq) {
    return { title: 'Bulunamadı | Fodos' }
  }
  
  return {
    title: `${faq.title} | Fodos Bilgi Bankası`,
    description: faq.content.substring(0, 160) + '...',
    keywords: ['telefon tamiri', 'yedek parça', faq.title.toLowerCase()]
  }
}

export default async function FaqDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params
  const faq = await getFaqBySlug(resolvedParams.slug)

  if (!faq) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <Link 
          href="/bilgi-bankasi" 
          className="inline-flex items-center text-sm font-medium text-trust-blue-600 hover:text-trust-blue-700 mb-8"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Bilgi Bankasına Dön
        </Link>

        <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 md:p-10">
            <div className="flex items-center space-x-2 mb-4 text-trust-blue-600">
              <Info className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Sıkça Sorulan Sorular</span>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 leading-snug">
              {faq.title}
            </h1>
            
            <div className="prose prose-blue max-w-none text-gray-700 leading-relaxed text-lg">
              {/* İçeriği satır sonlarına göre paragraflara böl */}
              {faq.content.split('\n\n').map((paragraph, idx) => (
                <p key={idx} className="mb-4">{paragraph}</p>
              ))}
            </div>
          </div>
          
          <div className="bg-gray-50 px-8 py-6 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500 font-medium">Bu içerik faydalı oldu mu?</p>
            <Link 
              href="/"
              className="text-sm font-bold text-trust-blue-600 hover:underline"
            >
              Uyumlu Parçaları İncele
            </Link>
          </div>
        </article>
      </div>
    </div>
  )
}
