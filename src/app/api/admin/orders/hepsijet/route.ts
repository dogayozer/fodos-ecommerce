import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendHepsijetOrder, HEPSIJET_IS_TEST } from '@/lib/hepsijet'

// Admin: seçilen siparişi HepsiJET'e STD gönderisi olarak iletir (/api/admin/* middleware ile korunuyor).
export async function POST(req: Request) {
  try {
    const { id } = await req.json()
    const order = await prisma.order.findUnique({ where: { id }, include: { customer: true } })
    if (!order) {
      return NextResponse.json({ error: 'Sipariş bulunamadı.' }, { status: 404 })
    }
    if (order.status === 'pending' || order.status === 'cancelled') {
      return NextResponse.json({ error: 'Ödemesi alınmamış veya iptal edilmiş sipariş gönderilemez.' }, { status: 400 })
    }
    if (order.shippingCompany === 'HepsiJET' && order.trackingNumber) {
      return NextResponse.json({ error: `Bu sipariş zaten HepsiJET'e gönderilmiş (takip no: ${order.trackingNumber}).` }, { status: 400 })
    }

    const result = await sendHepsijetOrder({
      orderNumber: order.orderNumber,
      customerName: order.customer?.name || order.companyTitle || 'Misafir Müşteri',
      customerPhone: order.customer?.phone || '',
      customerEmail: order.customer?.email,
      shippingCity: order.shippingCity?.trim() || '',
      shippingDistrict: order.shippingDistrict?.trim() || '',
      shippingAddress: order.shippingAddress || '',
    })
    if (!result.success) {
      return NextResponse.json({ error: `HepsiJET hatası: ${result.error}` }, { status: 502 })
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { trackingNumber: result.trackingNumber, shippingCompany: 'HepsiJET' },
    })
    return NextResponse.json({ success: true, test: HEPSIJET_IS_TEST, trackingNumber: updated.trackingNumber, trackingUrl: result.trackingUrl })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
