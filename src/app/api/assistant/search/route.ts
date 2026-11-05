import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isPriceOnRequest } from '@/lib/priceOnRequest'

// Akıllı asistanın "seçimli" (kategori/marka/model butonları) akışı için doğrudan
// veritabanı araması. AI'ya hiç gitmiyor — hem daha hızlı hem token maliyeti yok.
export async function POST(req: Request) {
  try {
    const { categorySlug, brand, model } = await req.json()

    const where: any = { status: { not: 'inactive' } }
    if (categorySlug) where.category = { slug: categorySlug }
    if (brand) where.brand = { equals: brand, mode: 'insensitive' }
    if (model && String(model).trim()) {
      const m = String(model).trim()
      where.OR = [
        { title: { contains: m, mode: 'insensitive' } },
        { compatible_models: { contains: m, mode: 'insensitive' } },
        { model_code: { contains: m, mode: 'insensitive' } },
      ]
    }

    const products = await prisma.product.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        sale_price: true,
        reference_price: true,
        stock_qty: true,
        category: { select: { slug: true } },
      },
      orderBy: [{ has_real_photo: 'desc' }, { stock_qty: 'desc' }],
      take: 8,
    })

    return NextResponse.json({
      products: products.map(({ category, ...p }) =>
        isPriceOnRequest(category?.slug) ? { ...p, sale_price: null, reference_price: null, priceOnRequest: true } : p
      ),
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
