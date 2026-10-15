import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getHepsijetLabelPdf } from '@/lib/hepsijet'

// Admin: HepsiJET gönderisinin resmi etiketini PDF olarak döndürür (/api/admin/* middleware ile korunuyor).
export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams
  const id = sp.get('id')
  const extra = sp.get('barcode') // ek gönderi barkodu (yalnızca siparişe kayıtlı olanlar)
  const order = id ? await prisma.order.findUnique({ where: { id } }) : null
  const extras = (order?.extraTrackingNumbers || '').split(',').filter(Boolean)
  const barcode = extra
    ? (extras.includes(extra) ? extra : null)
    : order?.shippingCompany === 'HepsiJET' ? order.trackingNumber : null
  if (!order || !barcode) {
    return new NextResponse('Bu sipariş için HepsiJET gönderisi bulunamadı.', { status: 404 })
  }

  try {
    const pdf = await getHepsijetLabelPdf(barcode)
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="hepsijet-${barcode}.pdf"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (e: any) {
    return new NextResponse(`HepsiJET etiketi alınamadı: ${e.message}`, { status: 502 })
  }
}
