import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// /api/admin/* zaten src/middleware.ts tarafından admin_session cookie'siyle korunuyor,
// bu route'a ekstra auth kontrolü gerekmiyor (mevcut /api/admin/orders pattern'iyle tutarlı).

export async function GET() {
  const accounts = await prisma.marketplaceAccount.findMany({
    orderBy: [{ platform: 'asc' }, { accountLabel: 'asc' }],
  })
  // apiSecret'ı listeleme yanıtında maskele — formda "değiştirmek istemiyorsan boş bırak" mantığı kullanılacak
  const masked = accounts.map((a) => ({ ...a, apiSecret: a.apiSecret ? '••••••••' : null }))
  return NextResponse.json({ accounts: masked })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { platform, accountLabel, apiKey, apiSecret, supplierId } = body

  if (!platform || !accountLabel) {
    return NextResponse.json({ error: 'platform ve accountLabel zorunlu' }, { status: 400 })
  }

  const account = await prisma.marketplaceAccount.create({
    data: { platform, accountLabel, apiKey, apiSecret, supplierId },
  })
  return NextResponse.json({ account })
}

export async function PUT(req: NextRequest) {
  const body = await req.json()
  const { id, accountLabel, apiKey, apiSecret, supplierId, isActive } = body

  if (!id) {
    return NextResponse.json({ error: 'id zorunlu' }, { status: 400 })
  }

  const data: Record<string, unknown> = {}
  if (accountLabel !== undefined) data.accountLabel = accountLabel
  if (supplierId !== undefined) data.supplierId = supplierId
  if (isActive !== undefined) data.isActive = isActive
  if (apiKey) data.apiKey = apiKey // boş gönderilirse mevcut değer korunur
  if (apiSecret) data.apiSecret = apiSecret

  const account = await prisma.marketplaceAccount.update({ where: { id }, data })
  return NextResponse.json({ account })
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'id zorunlu' }, { status: 400 })
  }
  await prisma.marketplaceAccount.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
