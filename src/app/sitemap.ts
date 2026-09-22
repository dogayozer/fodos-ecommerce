import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { getAllFaqs } from '@/lib/markdown'

// Revalidate olmadan bu route build/deploy anında donuyor: admin panelinden yapılan
// toplu ürün importları (kod deploy'u tetiklemiyor) sitemap'e hiç yansımıyordu. Saatte
// bir yenilenerek yeni ürünler bir sonraki deploy'u beklemeden Google'a görünür oluyor.
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.fodos.com.tr'

  // Statik sayfalarda lastModified veriliyorsa Next her sitemap üretiminde "new Date()"
  // yazıp Google'a "bu sayfa az önce değişti" gibi yanlış bir tazelik sinyali gönderiyordu
  // (sayfa aslında değişmemiş olsa bile). Bu sayfaların gerçek değişim tarihini
  // izlemediğimiz için lastModified'ı hiç vermiyoruz — Google kendi taramasına göre karar versin.
  const routes = [
    '',
    '/kvkk',
    '/mesafeli-satis-sozlesmesi',
    '/iade-ve-garanti',
    '/hakkimizda',
    '/gizlilik-ve-guvenlik',
    '/kargo-takibi',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.5,
  }))

  // Dynamic Products
  const products = await prisma.product.findMany({
    select: { slug: true, updatedAt: true, has_real_photo: true },
    where: { status: 'active' },
    take: 50000 // sitemap limit
  })

  // Gerçek/benzersiz fotoğrafı olan ürünler biraz daha yüksek öncelikli — tarayıcı
  // önce kaliteli sayfalara odaklansın (priority Google için kesin bir sinyal değil,
  // ama zararsız ve doğru kaynağa ağırlık veriyor).
  const productRoutes = products.map((product) => ({
    url: `${baseUrl}/urun/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: 'daily' as const,
    priority: product.has_real_photo ? 0.8 : 0.6,
  }))

  // Dynamic FAQs (Knowledge Base)
  const faqs = await getAllFaqs()
  const faqRoutes = faqs.map((faq) => ({
    url: `${baseUrl}/bilgi-bankasi/${faq.slug}`,
    lastModified: new Date(faq.date || new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Dynamic Categories — sadece en az bir aktif ürünü olan kategoriler (boş/çöp
  // kategorileri sitemap'e sokup ince/boş içerik sinyali vermemek için)
  const [categories, categoryMaxUpdates] = await Promise.all([
    prisma.category.findMany({
      where: { products: { some: { status: { not: 'inactive' } } } },
      select: { id: true, slug: true },
    }),
    // Kategori sayfasının lastModified'ı, içindeki ürünlerin en son ne zaman
    // güncellendiğinden gelsin — Google'ın "bu sayfayı yeniden tara" kararı için
    // gerçek bir sinyal (önceden hep "şu an" yazılıyordu, hiç güncellenmemiş olsa bile).
    prisma.product.groupBy({
      by: ['categoryId'],
      where: { status: 'active', categoryId: { not: null } },
      _max: { updatedAt: true },
    }),
  ])

  const categoryLastModMap = new Map(
    categoryMaxUpdates.map((c) => [c.categoryId, c._max.updatedAt])
  )

  const categoryRoutes = categories.map((category) => ({
    url: `${baseUrl}/kategori/${category.slug}`,
    lastModified: categoryLastModMap.get(category.id) || undefined,
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }))

  return [...routes, ...categoryRoutes, ...productRoutes, ...faqRoutes]
}
