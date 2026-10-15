import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendHepsijetOrder, HEPSIJET_IS_TEST } from '@/lib/hepsijet'

// Admin: aynı sipariş için EK bir HepsiJET gönderisi (eksik ürün / yeniden gönderim) oluşturur.
// Barkod = sipariş no + "-2", "-3"… (HepsiJET aynı barkodu ikinci kez kabul etmez). Ana takip no'ya dokunulmaz;
// ek barkodlar Order.extraTrackingNumbers'a eklenir ve müşteri hesabında da görünür. (/api/admin/* middleware ile korunuyor)
export async function POST(req: Request) {
  try {
    const { id } = await req.json()
    const order = await prisma.order.findUnique({ where: { id }, include: { customer: true } })
    if (!order) return NextResponse.json({ error: 'Sipariş bulunamadı.' }, { status: 404 })
    if (order.status === 'pending' || order.status === 'cancelled') {
      return NextResponse.json({ error: 'Ödemesi alınmamış veya iptal edilmiş sipariş gönderilemez.' }, { status: 400 })
    }

    const extras = (order.extraTrackingNumbers || '').split(',').filter(Boolean)
    const barcode = `${order.orderNumber}-${extras.length + 2}`

    const result = await sendHepsijetOrder({
      orderNumber: order.orderNumber,
      barcode,
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

    const saved = result.trackingNumber || barcode
    const updated = await prisma.order.update({
      where: { id },
      data: { extraTrackingNumbers: [...extras, saved].join(',') },
    })
    return NextResponse.json({ success: true, test: HEPSIJET_IS_TEST, barcode: saved, extraTrackingNumbers: updated.extraTrackingNumbers })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
