import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Model eğitimi için tarayan botlar kapalı (arama botları — OAI-SearchBot, Claude-SearchBot — açık kalır)
      { userAgent: ['GPTBot', 'ClaudeBot'], disallow: '/' },
      {
        userAgent: '*',
        allow: '/',
        // /kategori/*? : marka/model/sıralama filtreli adresler (her biri önbelleksiz sunucu işi ve DB sorgusu)
        disallow: ['/admin/', '/api/', '/sepet', '/odeme', '/giris', '/kayit-ol', '/hesabim', '/kategori/*?', '/arama'],
      },
    ],
    sitemap: 'https://www.fodos.com.tr/sitemap.xml',
  }
}
