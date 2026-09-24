import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// /api/admin/* zaten middleware ile admin oturumuna bağlı

export async function GET() {
  try {
    const [count, agg] = await Promise.all([
      prisma.dealerPrice.count(),
      prisma.dealerPrice.aggregate({ _avg: { price: true } }),
    ])
    return NextResponse.json({ count, avgPrice: agg._avg.price })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Aktif ürünlerin GÜNCEL satış fiyatı (fodos sale_price) üzerinden toplu bayi fiyatı
// üretir/günceller. Zaten bayi fiyatı elle düzeltilmiş bir ürün varsa da (şimdilik)
// aynı şekilde ezilir — ürün bazında elle yönetim ileride ayrı bir ekran gerektirir.
export async function POST(req: Request) {
  try {
    const { percent } = await req.json()
    const pct = parseFloat(percent)
    if (!(pct > 0 && pct < 100)) {
      return NextResponse.json({ error: 'İndirim oranı 0-100 arasında bir sayı olmalı' }, { status: 400 })
    }

    const factor = 1 - pct / 100
    const updatedCount: number = await prisma.$executeRawUnsafe(
      `
      INSERT INTO "DealerPrice" (id, "productId", price, "updatedAt", "createdAt")
      SELECT md5(random()::text || clock_timestamp()::text || id), id, ROUND((sale_price * $1::float)::numeric, 2), NOW(), NOW()
      FROM "Product"
      WHERE status = 'active'
      ON CONFLICT ("productId") DO UPDATE SET price = EXCLUDED.price, "updatedAt" = NOW()
      `,
      factor
    )

    return NextResponse.json({ success: true, updatedCount })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
