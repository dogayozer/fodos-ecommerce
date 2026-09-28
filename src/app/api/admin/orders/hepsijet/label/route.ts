import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getHepsijetLabelPdf } from '@/lib/hepsijet'

// Admin: HepsiJET gönderisinin resmi etiketini PDF olarak döndürür (/api/admin/* middleware ile korunuyor).
export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get('id')
  const order = id ? await prisma.order.findUnique({ where: { id } }) : null
  if (!order || order.shippingCompany !== 'HepsiJET' || !order.trackingNumber) {
    return new NextResponse('Bu sipariş için HepsiJET gönderisi bulunamadı.', { status: 404 })
  }

  try {
    const pdf = await getHepsijetLabelPdf(order.trackingNumber)
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="hepsijet-${order.orderNumber}.pdf"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (e: any) {
    return new NextResponse(`HepsiJET etiketi alınamadı: ${e.message}`, { status: 502 })
  }
}
