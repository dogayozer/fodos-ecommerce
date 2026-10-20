import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { issueLicensesForOrder } from '@/lib/licenseIssue'
import { sendLicenseMail } from '@/lib/orderMail'

// Admin: dijital sipariş için lisans anahtarını (yeniden) üretir ya da müşteriye yeniden mailler.
// Anahtar zaten varsa mail tekrar gönderilir; yoksa kucukis.com'dan alınır (idempotent) ve mail atılır.
// (/api/admin/* middleware ile korunuyor)
export async function POST(req: Request) {
  try {
    const { id } = await req.json()
    const order = await prisma.order.findUnique({ where: { id }, include: { licenseKeys: true } })
    if (!order) return NextResponse.json({ error: 'Sipariş bulunamadı.' }, { status: 404 })
    if (['pending', 'cancelled'].includes(order.status)) {
      return NextResponse.json({ error: 'Ödemesi alınmamış veya iptal edilmiş sipariş için lisans verilemez.' }, { status: 400 })
    }

    if (order.licenseKeys.length > 0) {
      const sent = await sendLicenseMail(order.orderNumber)
      if (!sent) return NextResponse.json({ error: 'Mail gönderilemedi (müşteri e-postası ya da mail servisi anahtarı yok).' }, { status: 400 })
      return NextResponse.json({ success: true, action: 'resent', keys: order.licenseKeys.map((k) => k.key) })
    }

    if (!process.env.LISANS_ISSUE_TOKEN) {
      return NextResponse.json({ error: 'LISANS_ISSUE_TOKEN tanımlı değil; otomatik lisans üretimi kapalı.' }, { status: 400 })
    }
    const result = await issueLicensesForOrder(order.orderNumber)
    if (!result.ok) return NextResponse.json({ error: `Lisans alınamadı: ${result.reason}` }, { status: 502 })
    const keys = await prisma.licenseKey.findMany({ where: { orderId: order.id }, orderBy: { createdAt: 'asc' } })
    return NextResponse.json({ success: true, action: 'issued', keys: keys.map((k) => k.key) })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
