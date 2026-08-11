import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const cookieStore: any = cookies()
  const store = cookieStore instanceof Promise ? await cookieStore : cookieStore
  const session = store.get('admin_session')
  
  if (session?.value !== 'authenticated') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { increasePercent, discountPercent, modelFilter, resetToOriginal } = await req.json()

    let updatedCount = 0

    const whereClause: any = { status: 'active' }
    if (modelFilter) {
      whereClause.model_code = { contains: modelFilter, mode: 'insensitive' }
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      select: { id: true, original_excel_price: true }
    })

    await prisma.$transaction(async (tx) => {
      for (const product of products) {
        if (!product.original_excel_price) continue; // Original price yoksa atla

        let newRefPrice = null;
        let newSalePrice = product.original_excel_price;

        if (!resetToOriginal) {
          // Zam (reference) hesapla
          if (increasePercent > 0) {
            newRefPrice = product.original_excel_price * (1 + (increasePercent / 100))
          } else {
            newRefPrice = product.original_excel_price // Zam yoksa kendisi çizili fiyat
          }

          // İndirim (sale) hesapla
          if (discountPercent > 0) {
            newSalePrice = newRefPrice * (1 - (discountPercent / 100))
          } else {
            newSalePrice = newRefPrice
          }

          // Yuvarlama
          if (newRefPrice) newRefPrice = Math.round(newRefPrice * 100) / 100
          newSalePrice = Math.round(newSalePrice * 100) / 100
        }

        await tx.product.update({
          where: { id: product.id },
          data: {
            reference_price: newRefPrice,
            sale_price: newSalePrice
          }
        })

        updatedCount++
      }
    }, {
      timeout: 120000 // 2 dakika
    })

    // Cache temizliği
    const { revalidateTag } = await import('next/cache')
    // @ts-ignore
    revalidateTag('products-data')
    // @ts-ignore
    revalidateTag('category-tree')

    return NextResponse.json({
      success: true,
      summary: {
        updatedCount
      }
    })

  } catch (error: any) {
    console.error('Bulk update error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
