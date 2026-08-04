import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

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

  return [...routes, ...productRoutes]
}
