import Link from 'next/link'
import { prisma } from '@/lib/prisma'

// Ana sayfa "Sıkça Sorulan Sorular": aranan ifadeler (cep telefonu parça / parçası / yedek parça) görünür metinde,
// kargo ve ücret bilgileri mağaza ayarlarından gelir. Aynı içerik FAQPage JSON-LD olarak da yazılır.
export async function HomeFaq() {
  const s = await prisma.storeSettings.findUnique({
    where: { id: 'default' },
    select: { shippingThreshold: true, shippingFee: true, sameDayShippingTime: true },
  })
  const threshold = (s?.shippingThreshold ?? 1500).toLocaleString('tr-TR')
  const fee = (s?.shippingFee ?? 120).toLocaleString('tr-TR')
  const cutoff = s?.sameDayShippingTime || '16:00'

  const faqs: { q: string; a: string }[] = [
    {
      q: 'Fodos’ta hangi cep telefonu yedek parça çeşitleri var?',
      a: 'Apple, Samsung, Xiaomi, Huawei, Oppo, Tecno, Infinix ve birçok markanın modeline uygun ekran, batarya, şarj soketi (şarj bordu), arka kapak, kamera, hoparlör, ses ve güç tuşu, flex kablo gibi cep telefonu parçası seçeneklerini bulabilirsiniz.',
    },
    {
      q: 'Cep telefonu parçasının modelime uyumlu olduğunu nasıl anlarım?',
      a: 'Ürün başlığında ve açıklamasında uyumlu telefon modelleri yazılıdır. Sitedeki arama kutusuna telefonunuzun modelini veya model kodunu yazarak o modele uygun cep telefonu yedek parça ürünlerini listeleyebilirsiniz. Emin olamazsanız WhatsApp hattımızdan sorabilirsiniz.',
    },
    {
      q: 'Toptan cep telefonu parça alımı yapabilir miyim?',
      a: 'Evet. Teknik servisler ve telefoncular için bayi hesabı sunuyoruz. Bayi hesabı onaylandıktan sonra bayiye özel fiyatlarla toptan cep telefonu yedek parça alabilirsiniz. Ayrıntı için Bayi sayfasına bakabilirsiniz.',
    },
    {
      q: 'Siparişim ne zaman kargoya verilir?',
      a: `Saat ${cutoff}’a kadar verilen ve ödemesi onaylanan siparişler stok durumuna bağlı olarak aynı gün kargoya verilir. Kargoya verildiğinde takip numaranız e-posta ile size iletilir.`,
    },
    {
      q: 'Kargo ücreti ne kadar?',
      a: `${threshold} TL ve üzeri siparişlerde kargo ücretsizdir. Bu tutarın altındaki siparişlerde kargo ücreti ${fee} TL’dir.`,
    },
    {
      q: 'Ödeme güvenli mi, hangi yöntemlerle ödeyebilirim?',
      a: 'Ödemeler PayTR güvenli ödeme altyapısı üzerinden kredi/banka kartı ile alınır. Kart bilgileriniz sitemizde saklanmaz.',
    },
    {
      q: 'Fatura veriyor musunuz?',
      a: 'Evet, siparişleriniz için e-arşiv fatura düzenlenir. Bireysel ve kurumsal (vergi numaralı) fatura için sipariş sırasında bilgilerinizi girebilirsiniz.',
    },
    {
      q: 'İade ve değişim nasıl yapılır?',
      a: 'İade, değişim ve garanti koşulları İade ve Garanti sayfamızda açıklanmıştır. Sorun yaşarsanız bizimle WhatsApp veya telefon üzerinden iletişime geçebilirsiniz.',
    },
  ]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  }

  return (
    <section className="py-12 bg-neutral-0">
      <div className="px-4 sm:px-6 lg:px-8 max-w-4xl">
        <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-6">Sıkça Sorulan Sorular</h2>
        <div className="divide-y divide-neutral-200 border border-neutral-200 rounded-xl overflow-hidden">
          {faqs.map((f) => (
            <details key={f.q} className="group bg-neutral-0 p-4 sm:p-5">
              <summary className="cursor-pointer list-none flex justify-between items-center gap-4 font-semibold text-neutral-900">
                {f.q}
                <span className="text-trust-blue-600 text-xl leading-none transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm sm:text-base text-neutral-600 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
        <p className="mt-4 text-sm text-neutral-500">
          Daha fazla bilgi için <Link href="/bilgi-bankasi" className="text-trust-blue-600 font-semibold hover:underline">Bilgi Bankası</Link> sayfasına göz atabilirsiniz.
        </p>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </section>
  )
}
