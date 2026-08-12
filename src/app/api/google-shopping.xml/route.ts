import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: {
        status: 'active',
      },
      include: {
        images: true,
        category: true,
      }
    })

    const siteUrl = 'https://fodos.com.tr'

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
      const description = product.description_raw ? product.description_raw.substring(0, 4900).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : product.title
      
      xml += `
    <item>
      <g:id>${product.barcode}</g:id>
      <g:title>${product.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</g:title>
      <g:description>${description}</g:description>
      <g:link>${productLink}</g:link>
      <g:image_link>${imageLink}</g:image_link>
      <g:condition>new</g:condition>
      <g:availability>${availability}</g:availability>
      <g:price>${product.sale_price.toFixed(2)} TRY</g:price>
      <g:brand>${brand}</g:brand>
      <g:gtin>${product.barcode}</g:gtin>
      ${product.category ? `<g:product_type>${product.category.name}</g:product_type>` : ''}
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
