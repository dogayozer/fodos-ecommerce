import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        orders: {
          include: {
            items: {
              include: {
                product: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return NextResponse.json(customers)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Bayi statüsü ver/al — /api/admin/* zaten middleware ile admin oturumuna bağlı
export async function PATCH(req: Request) {
  try {
    const { customerId, isDealer } = await req.json()
    if (!customerId || typeof isDealer !== 'boolean') {
      return NextResponse.json({ error: 'customerId ve isDealer (boolean) zorunlu' }, { status: 400 })
    }

    const customer = await prisma.customer.update({
      where: { id: customerId },
      data: {
        isDealer,
        dealerApprovedAt: isDealer ? new Date() : null,
      },
    })
    return NextResponse.json({ success: true, customer })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
