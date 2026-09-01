import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/sepet', '/odeme', '/giris', '/kayit-ol', '/hesabim'],
    },
    sitemap: 'https://fodos.com.tr/sitemap.xml',
  }
}
