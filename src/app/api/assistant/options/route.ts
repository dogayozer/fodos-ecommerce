import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Akıllı asistanın "seçimli" (butonlu) adımı için hafif, AI'sız veri kaynağı.
// Kategori ve marka listelerini döner — LLM'e hiç gitmeden, token maliyeti sıfır.
export async function GET() {
  try {
    const [categories, brandRows] = await Promise.all([
      prisma.category.findMany({
        where: { products: { some: { status: { not: 'inactive' } } } },
        select: { name: true, slug: true },
        orderBy: { name: 'asc' },
      }),
      prisma.product.findMany({
        where: { status: { not: 'inactive' }, brand: { not: null } },
        select: { brand: true },
        distinct: ['brand'],
        take: 24,
      }),
    ])

    const brands = brandRows.map((b) => b.brand).filter(Boolean) as string[]

    return NextResponse.json({ categories, brands })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
