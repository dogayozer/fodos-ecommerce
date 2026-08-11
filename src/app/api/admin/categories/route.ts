import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

async function checkAuth() {
  const cookieStore: any = cookies()
  const store = cookieStore instanceof Promise ? await cookieStore : cookieStore
  const session = store.get('admin_session')
  return session?.value === 'authenticated'
}

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { name: 'asc' }
    })
    return NextResponse.json({ categories })
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  if (!await checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { name, slug, template_type } = await req.json()
    if (!name || !slug || !template_type) return NextResponse.json({ error: 'Eksik bilgi' }, { status: 400 })

    const existing = await prisma.category.findUnique({ where: { slug } })
    if (existing) return NextResponse.json({ error: 'Bu slug zaten kullanımda' }, { status: 400 })

    const category = await prisma.category.create({
      data: { name, slug, template_type }
    })
    
    const { revalidateTag } = await import('next/cache')
    // @ts-ignore
    revalidateTag('category-tree')

    return NextResponse.json({ category })
  } catch (error: any) {
    return NextResponse.json({ error: 'Kategori oluşturulamadı' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  if (!await checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { id } = await req.json()
    
    // Check if it has products and set them to null (kategorisiz)
    await prisma.product.updateMany({
      where: { categoryId: id },
      data: { categoryId: null }
    })

    await prisma.category.delete({ where: { id } })
    
    const { revalidateTag } = await import('next/cache')
    // @ts-ignore
    revalidateTag('category-tree')
    // @ts-ignore
    revalidateTag('products-data')

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: 'Kategori silinemedi' }, { status: 500 })
  }
}
