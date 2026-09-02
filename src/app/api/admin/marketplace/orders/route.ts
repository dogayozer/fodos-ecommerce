import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') // new | processing | supplied | cancelled | null (hepsi)

  const orders = await prisma.marketplaceOrder.findMany({
    where: status ? { status } : undefined,
    include: {
      account: { select: { platform: true, accountLabel: true } },
      items: true,
    },
    orderBy: { platformCreatedAt: 'desc' },
    take: 200,
  })
  return NextResponse.json({ orders })
}

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { id, status, supplierNote, supplyCost } = body

  if (!id) {
    return NextResponse.json({ error: 'id zorunlu' }, { status: 400 })
  }

  const data: Record<string, unknown> = {}
  if (status !== undefined) {
    data.status = status
    if (status === 'supplied') data.suppliedAt = new Date()
  }
  if (supplierNote !== undefined) data.supplierNote = supplierNote
  if (supplyCost !== undefined) data.supplyCost = supplyCost === '' || supplyCost === null ? null : Number(supplyCost)

  const order = await prisma.marketplaceOrder.update({ where: { id }, data })
  return NextResponse.json({ order })
}
