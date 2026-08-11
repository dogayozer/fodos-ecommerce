import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { prisma } from '@/lib/prisma'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fodos-super-secret-customer-key')

export async function GET() {
  try {
    const cookieStore: any = cookies()
    const store = cookieStore instanceof Promise ? await cookieStore : cookieStore
    const token = store.get('customer_token')?.value

    if (!token) {
      return NextResponse.json({ user: null })
    }

    const { payload } = await jwtVerify(token, JWT_SECRET)
    if (!payload.sub) {
      return NextResponse.json({ user: null })
    }

    const user = await prisma.customer.findUnique({
      where: { id: payload.sub as string },
      include: {
        _count: {
          select: { orders: { where: { status: { in: ['paid', 'shipped', 'delivered', 'completed'] } } } }
        }
      }
    })

    if (!user || user.isGuest) {
      return NextResponse.json({ user: null })
    }

    // Return user with order count to determine discount eligibility
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        city: user.city,
        district: user.district,
        address: user.address,
        completedOrdersCount: user._count.orders
      }
    })
  } catch (error) {
    return NextResponse.json({ user: null })
  }
}
