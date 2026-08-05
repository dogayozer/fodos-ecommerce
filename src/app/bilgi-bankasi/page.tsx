import { getAllFaqs } from '@/lib/markdown'
import { FaqClient } from './FaqClient'

export const metadata = {
  title: 'Bilgi Bankası | Sıkça Sorulan Sorular ve Tamir Rehberi',
  description: 'Cep telefonu tamiri, ekran teknolojileri, batarya değişim süreçleri ve orijinal yedek parçalar hakkında detaylı bilgi bankası ve sıkça sorulan sorular.',
  keywords: ['cep telefonu tamiri', 'bilgi bankası', 'telefon yedek parça', 'batarya bms', 'soft oled ekran', 'cep telefonu ekranı']
}

export default async function KnowledgeBasePage() {
  const faqs = await getAllFaqs()

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            Bilgi Bankası ve Sıkça Sorulan Sorular
          </h1>
          <p className="text-lg text-gray-600">
            Cihazınızı güvenle onarmanız ve doğru yedek parçayı seçmeniz için hazırladığımız profesyonel rehberimiz.
          </p>
        </div>

        <FaqClient faqs={faqs} />
      </div>
    </div>
  )
}
