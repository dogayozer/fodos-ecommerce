import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// /api/admin/* zaten middleware ile admin oturumuna bağlı

const PAGE_SIZE = 30

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (id) {
      const product = await prisma.product.findUnique({
        where: { id },
        include: { images: { orderBy: { order: 'asc' } }, dealerPrice: true, category: { select: { name: true } } },
      })
      if (!product) return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 })
      return NextResponse.json({ product })
    }

    const q = (searchParams.get('q') || '').trim()
    const category = searchParams.get('category') || ''
    const status = searchParams.get('status') || ''
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)

    const where: any = {}
    if (category === 'none') where.categoryId = null
    else if (category) where.categoryId = category
    if (status) where.status = status
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { barcode: { contains: q, mode: 'insensitive' } },
        { model_code: { contains: q, mode: 'insensitive' } },
        { brand: { contains: q, mode: 'insensitive' } },
      ]
    }

    const [total, products, categories] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        select: {
          id: true, barcode: true, title: true, brand: true, slug: true, status: true,
          sale_price: true, reference_price: true, mpm_sale_price: true, mpm_reference_price: true,
          stock_qty: true, category: { select: { name: true } },
          images: { select: { url: true }, orderBy: { order: 'asc' }, take: 1 },
        },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      prisma.category.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
    ])

    return NextResponse.json({ products, total, page, pageSize: PAGE_SIZE, categories })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

const num = (v: any) => (v === '' || v === null || v === undefined ? null : Number(v))

export async function PATCH(req: Request) {
  try {
    const b = await req.json()
    if (!b.id) return NextResponse.json({ error: 'Ürün id eksik' }, { status: 400 })

    const sale = Number(b.sale_price)
    if (!(sale >= 0)) return NextResponse.json({ error: 'Satış fiyatı geçersiz' }, { status: 400 })
    if (!String(b.title || '').trim()) return NextResponse.json({ error: 'Ürün adı boş olamaz' }, { status: 400 })
    if (!['active', 'inactive', 'out_of_stock'].includes(b.status)) {
      return NextResponse.json({ error: 'Durum geçersiz' }, { status: 400 })
    }
    for (const k of ['reference_price', 'mpm_sale_price', 'mpm_reference_price']) {
      const v = num(b[k])
      if (v !== null && !(v >= 0)) return NextResponse.json({ error: `${k} geçersiz` }, { status: 400 })
    }

    const images: string[] | undefined = Array.isArray(b.images)
      ? b.images.map((u: any) => String(u).trim()).filter(Boolean)
      : undefined
    if (images?.some(u => !/^https?:\/\//.test(u) && !u.startsWith('/'))) {
      return NextResponse.json({ error: 'Resim adresleri http(s):// ile veya / ile başlamalı' }, { status: 400 })
    }

    const data: any = {
      title: String(b.title).trim(),
      brand: b.brand ? String(b.brand).trim() : null,
      model_code: b.model_code ? String(b.model_code).trim() : null,
      categoryId: b.categoryId || null,
      sale_price: sale,
      reference_price: num(b.reference_price),
      mpm_sale_price: num(b.mpm_sale_price),
      mpm_reference_price: num(b.mpm_reference_price),
      stock_qty: Math.max(0, parseInt(b.stock_qty, 10) || 0),
      status: b.status,
      campaign: b.campaign ? String(b.campaign).trim() : null,
      has_real_photo: !!b.has_real_photo,
      description_raw: b.description_raw ?? null,
    }

    const old = await prisma.product.findUnique({ where: { id: b.id }, select: { sale_price: true, slug: true } })
    if (!old) return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 })

    await prisma.$transaction(async (tx) => {
      await tx.product.update({ where: { id: b.id }, data })
      if (old.sale_price !== sale) {
        await tx.priceHistory.create({ data: { productId: b.id, oldPrice: old.sale_price, newPrice: sale } })
      }
      if (images) {
        await tx.productImage.deleteMany({ where: { productId: b.id } })
        if (images.length) {
          await tx.productImage.createMany({
            data: images.map((url, order) => ({ productId: b.id, url, order })),
          })
        }
      }
      if (b.dealer_price !== undefined) {
        const dp = num(b.dealer_price)
        if (dp === null) await tx.dealerPrice.deleteMany({ where: { productId: b.id } })
        else await tx.dealerPrice.upsert({
          where: { productId: b.id },
          create: { productId: b.id, price: dp },
          update: { price: dp },
        })
      }
    })

    const { revalidateTag, revalidatePath } = await import('next/cache')
    revalidateTag('products-data', 'max')
    revalidatePath(`/urun/${old.slug}`)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
