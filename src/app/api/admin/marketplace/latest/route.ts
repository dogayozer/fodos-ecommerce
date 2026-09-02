import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// src/components/OrderNotifier.tsx'in /api/admin/latest-order için kullandığı
// polling pattern'inin pazaryeri siparişleri karşılığı.
export async function GET() {
  const order = await prisma.marketplaceOrder.findFirst({
    where: { status: 'new' },
    orderBy: { createdAt: 'desc' },
    include: { account: { select: { platform: true, accountLabel: true } } },
  })
  return NextResponse.json({ order })
}
