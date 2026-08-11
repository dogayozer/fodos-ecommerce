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
  if (!await checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json({ coupons })
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  if (!await checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { code, type, value } = await req.json()
    if (!code || !type || !value) return NextResponse.json({ error: 'Eksik bilgi' }, { status: 400 })

    const existing = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } })
    if (existing) return NextResponse.json({ error: 'Bu kod zaten kullanımda' }, { status: 400 })

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        type,
        value: parseFloat(value)
      }
    })
    return NextResponse.json({ coupon })
  } catch (error: any) {
    return NextResponse.json({ error: 'Kupon oluşturulamadı' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  if (!await checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { id, isActive } = await req.json()
    const coupon = await prisma.coupon.update({
      where: { id },
      data: { isActive }
    })
    return NextResponse.json({ coupon })
  } catch (error: any) {
    return NextResponse.json({ error: 'Kupon güncellenemedi' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  if (!await checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { id } = await req.json()
    await prisma.coupon.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: 'Kupon silinemedi' }, { status: 500 })
  }
}
