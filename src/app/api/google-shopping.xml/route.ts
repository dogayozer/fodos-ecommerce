import { NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'

// Feed ~25 MB: her istekte 16k ürünü DB'den çekmek Neon ağ trafiği/compute maliyeti yaratıyordu.
// Tüm cevap ISR (19 MB sınırı) ve CDN önbelleğine sığmadığı için DB sonucu, veri önbelleğinin
// öğe başına ~2 MB sınırının altında kalacak parçalar halinde saatte bir yenilenerek saklanır.
export const maxDuration = 60

const CHUNK_SIZE = 800
const where = { status: 'active' }

const getActiveCount = unstable_cache(() => prisma.product.count({ where }), ['feed-active-count'], { revalidate: 3600 })

const getChunk = unstable_cache(
  (index: number) =>
    prisma.product.findMany({
      where,
      orderBy: { id: 'asc' },
      skip: index * CHUNK_SIZE,
      take: CHUNK_SIZE,
      select: {
        slug: true,
        title: true,
        brand: true,
        barcode: true,
        stock_qty: true,
        sale_price: true,
        description_raw: true,
        images: { select: { url: true }, orderBy: { order: 'asc' }, take: 1 },
        category: { select: { name: true } },
      },
    }),
  ['feed-products-chunk'],
  { revalidate: 3600 }
)

export async function GET() {
  try {
    const chunkCount = Math.ceil((await getActiveCount()) / CHUNK_SIZE)
    // Sırayla: paralel istek Prisma bağlantı havuzunu tüketip zaman aşımına düşüyor
    const products = []
    for (let i = 0; i < chunkCount; i++) products.push(...(await getChunk(i)))

    const siteUrl = 'https://www.fodos.com.tr'

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Fodos ve Piaks</title>
    <link>${siteUrl}</link>
    <description>Orijinal Cep Telefonu Yedek Parçaları ve Aksesuarları</description>`

    products.forEach((product: any) => {
      const productLink = `${siteUrl}/urun/${product.slug}`
      const imageLink = product.images?.[0]?.url || `${siteUrl}/logo.png`
      const availability = product.stock_qty > 0 ? 'in_stock' : 'out_of_stock'
      const brand = product.brand || 'Fodos'
      
      // Strip control characters that break XML
      const stripInvalidXml = (str: string) => {
        if (!str) return ''
        return str.replace(/[^\x09\x0A\x0D\x20-\uD7FF\uE000-\uFFFD\u10000-\u10FFFF]/g, '')
      }

      const safeTitle = stripInvalidXml(product.title)
      const rawDesc = product.description_raw ? product.description_raw.substring(0, 4900) : product.title
      const safeDescription = stripInvalidXml(rawDesc)
      const safeBrand = stripInvalidXml(brand)
      const safeBarcode = stripInvalidXml(product.barcode)
      const categoryName = product.category ? stripInvalidXml(product.category.name) : ''
      
      xml += `
    <item>
      <g:id><![CDATA[${safeBarcode}]]></g:id>
      <g:title><![CDATA[${safeTitle}]]></g:title>
      <g:description><![CDATA[${safeDescription}]]></g:description>
      <g:link><![CDATA[${productLink}]]></g:link>
      <g:image_link><![CDATA[${imageLink}]]></g:image_link>
      <g:condition>new</g:condition>
      <g:availability>${availability}</g:availability>
      <g:price>${product.sale_price.toFixed(2)} TRY</g:price>
      <g:brand><![CDATA[${safeBrand}]]></g:brand>
      <g:gtin><![CDATA[${safeBarcode}]]></g:gtin>
      ${categoryName ? `<g:product_type><![CDATA[${categoryName}]]></g:product_type>` : ''}
    </item>`
    })

    xml += `
  </channel>
</rss>`

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate',
      },
    })
  } catch (error) {
    console.error('XML Feed Generation Error:', error)
    return new NextResponse('Error generating feed', { status: 500 })
  }
}
