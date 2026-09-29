import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cancelHepsijetOrder, HEPSIJET_IS_TEST } from '@/lib/hepsijet'

// Admin: siparişin HepsiJET gönderisini iptal eder (/api/admin/* middleware ile korunuyor).
// Başarılı olursa siparişteki takip no/kargo firması temizlenir; gönderi yeniden oluşturulabilir.
export async function POST(req: Request) {
  try {
    const { id } = await req.json()
    const order = await prisma.order.findUnique({ where: { id } })
    if (!order || order.shippingCompany !== 'HepsiJET' || !order.trackingNumber) {
      return NextResponse.json({ error: 'Bu sipariş için HepsiJET gönderisi bulunamadı.' }, { status: 404 })
    }
    if (order.status === 'shipped' || order.status === 'delivered') {
      return NextResponse.json({ error: 'Kargolandı/teslim edildi durumundaki sipariş iptal edilemez.' }, { status: 400 })
    }

    const result = await cancelHepsijetOrder(order.trackingNumber)
    if (!result.success) {
      return NextResponse.json({ error: `HepsiJET hatası: ${result.error}` }, { status: 502 })
    }

    await prisma.order.update({ where: { id }, data: { trackingNumber: null, shippingCompany: null } })
    return NextResponse.json({ success: true, test: HEPSIJET_IS_TEST })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
