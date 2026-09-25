import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateBirfatura, findOrderByBirfaturaId, readJsonBody, statusFromId } from '@/lib/birfatura'

// BirFatura: body { orderId, orderStatusId, cargoTrackingCode, cargoTrackingCodeUrl?, cargoCompany?, updateDateTime? }
export async function POST(req: Request) {
  try {
    if (!(await authenticateBirfatura(req))) {
      return NextResponse.json({ status: false, error: 'Unauthorized. Geçersiz veya eksik API Anahtarı.' }, { status: 200 })
    }

    const body = await readJsonBody(req)
    const order = await findOrderByBirfaturaId(body.orderId)
    if (!order) {
      return NextResponse.json({ status: false, error: 'Belirtilen sipariş bulunamadı.' }, { status: 200 })
    }

    const data: any = {}
    if (body.cargoTrackingCode) data.trackingNumber = String(body.cargoTrackingCode)
    if (body.cargoCompany) data.shippingCompany = String(body.cargoCompany)

    const status = statusFromId(body.orderStatusId) ?? (body.cargoTrackingCode ? 'shipped' : null)
    if (status && order.status !== 'cancelled') data.status = status

    await prisma.order.update({ where: { id: order.id }, data })
    return NextResponse.json({ status: true })
  } catch (error: any) {
    console.error('BirFatura cargo update error:', error)
    return NextResponse.json({ status: false, error: error.message }, { status: 200 })
  }
}
