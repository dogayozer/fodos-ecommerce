import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { revalidateTag } from 'next/cache'

export async function POST(req: Request) {
  const cookieStore: any = cookies()
  const store = cookieStore instanceof Promise ? await cookieStore : cookieStore
  const session = store.get('admin_session')
  
  if (session?.value !== 'authenticated') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { oldUsd, newUsd, shippingCost } = await req.json()

    if (!oldUsd || !newUsd || oldUsd <= 0 || newUsd <= 0 || shippingCost === undefined) {
      return NextResponse.json({ error: 'Geçersiz kur veya kargo değeri' }, { status: 400 })
    }

    const multiplier = newUsd / oldUsd

    // Tüm aktif ürünleri getir
    const products = await prisma.product.findMany({
      where: { status: 'active' },
      select: { id: true, reference_price: true }
    })

    let updatedCount = 0

    // Prisma işlemlerini transaction veya batch halinde yapmak daha performanslı olur ama
    // matematiksel işlemler olduğu için memory'de hesaplayıp update edeceğiz.
    // Chunklara bölerek update yapalım (sqlite/postgres transaction limitlerine takılmamak için)
    
    await prisma.$transaction(async (tx) => {
      for (const product of products) {
        if (!product.reference_price) continue;

        // Eski üstü çizili fiyatı kura göre artır
        const newRefPrice = product.reference_price * multiplier
        
        // Net fiyatı kargo düşülerek bul
        let netPrice = newRefPrice - shippingCost
        
        // %20 iskonto (standart)
        let salePrice = netPrice * 0.80

        // Minimum 99 TL kuralı
        if (salePrice < 99) {
          salePrice = 99
        }

        await tx.product.update({
          where: { id: product.id },
          data: {
            reference_price: newRefPrice,
            sale_price: salePrice
          }
        })

        updatedCount++
      }
    }, {
      timeout: 60000 // Uzun sürebilir diye timeout'u artırıyoruz
    })

    // Cache temizliği
    revalidateTag('products-data')
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
