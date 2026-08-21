import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    // Check admin session (basic check based on how the app does it)
    const cookieStore: any = cookies()
    const store = cookieStore instanceof Promise ? await cookieStore : cookieStore
    const session = store.get('admin_session')

    if (session?.value !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the latest single order
    const latestOrder = await prisma.order.findFirst({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        orderNumber: true,
        createdAt: true,
        totalAmount: true
      }
    })

    if (!latestOrder) {
      return NextResponse.json({ order: null })
    }

    return NextResponse.json({ order: latestOrder })
  } catch (error: any) {
    console.error('Latest order fetch error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
