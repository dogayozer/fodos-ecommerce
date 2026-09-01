import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { getAllFaqs } from '@/lib/markdown'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://fodos.com.tr'
  
  // Static Routes
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
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.5,
  }))

  // Dynamic Products
  const products = await prisma.product.findMany({
    select: { slug: true, updatedAt: true },
    where: { status: 'active' },
    take: 50000 // sitemap limit
  })

  const productRoutes = products.map((product) => ({
    url: `${baseUrl}/urun/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: 'daily' as const,
    priority: 0.8,
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
  const categories = await prisma.category.findMany({
    where: { products: { some: { status: { not: 'inactive' } } } },
    select: { slug: true }
  })
  
  const categoryRoutes = categories.map((category) => ({
    url: `${baseUrl}/kategori/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }))

  return [...routes, ...categoryRoutes, ...productRoutes, ...faqRoutes]
}
