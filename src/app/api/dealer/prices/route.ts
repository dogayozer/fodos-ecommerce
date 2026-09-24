import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCustomerFromRequest } from '@/lib/customerAuth'

const PAGE_SIZE = 30

export async function GET(req: Request) {
  const customer = await getCustomerFromRequest()
  if (!customer) {
    return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 })
  }
  if (!customer.isDealer) {
    return NextResponse.json({ error: 'Bu alan sadece bayilerimize açıktır' }, { status: 403 })
  }

  const url = new URL(req.url)
  const q = (url.searchParams.get('q') || '').trim()
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1') || 1)

  const where: any = {}
  if (q) {
    where.product = {
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { barcode: { contains: q, mode: 'insensitive' } },
        { model_code: { contains: q, mode: 'insensitive' } },
        { brand: { contains: q, mode: 'insensitive' } },
      ],
    }
  }

  const [total, rows] = await Promise.all([
    prisma.dealerPrice.count({ where }),
    prisma.dealerPrice.findMany({
      where,
      include: {
        product: {
          select: {
            id: true, title: true, barcode: true, brand: true, stock_qty: true, slug: true,
            images: { take: 1, orderBy: { order: 'asc' }, select: { url: true } },
          },
        },
      },
      orderBy: { product: { title: 'asc' } },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ])

  return NextResponse.json({
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    items: rows.map(r => ({
      productId: r.product.id,
      title: r.product.title,
      barcode: r.product.barcode,
      brand: r.product.brand,
      stock_qty: r.product.stock_qty,
      slug: r.product.slug,
      image: r.product.images[0]?.url || null,
      dealerPrice: r.price,
    })),
  })
}
