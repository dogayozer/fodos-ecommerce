import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// /api/admin/* middleware ile admin oturumuna bağlı
export async function GET() {
  try {
    const signups = await prisma.dealerNewsletterSignup.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(signups)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
