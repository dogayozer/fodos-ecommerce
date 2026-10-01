import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// /api/admin/* middleware ile korunur (admin oturumu şart).
export async function POST(req: Request) {
  const sub = await req.json().catch(() => null)
  if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) {
    return NextResponse.json({ error: 'Geçersiz abonelik' }, { status: 400 })
  }
  await prisma.adminPushSubscription.upsert({
    where: { endpoint: sub.endpoint },
    update: { p256dh: sub.keys.p256dh, auth: sub.keys.auth },
    create: { endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth },
  })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: Request) {
  const { endpoint } = (await req.json().catch(() => ({}))) as { endpoint?: string }
  if (endpoint) await prisma.adminPushSubscription.deleteMany({ where: { endpoint } })
  return NextResponse.json({ ok: true })
}
