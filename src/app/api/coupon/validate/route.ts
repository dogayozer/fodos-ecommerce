import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { code } = await req.json()

    if (!code) {
      return NextResponse.json({ error: 'Kupon kodu giriniz' }, { status: 400 })
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() }
    })

    if (!coupon) {
      return NextResponse.json({ error: 'Geçersiz kupon kodu' }, { status: 400 })
    }

    if (!coupon.isActive) {
      return NextResponse.json({ error: 'Bu kuponun süresi dolmuş veya pasif' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      type: coupon.type, // 'percentage' or 'fixed'
      value: coupon.value
    })
  } catch (error: any) {
    return NextResponse.json({ error: 'Kupon doğrulanırken hata oluştu' }, { status: 500 })
  }
}
