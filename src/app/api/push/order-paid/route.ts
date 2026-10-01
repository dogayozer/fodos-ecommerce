import { NextResponse } from 'next/server'
import { notifyPaidOrder } from '@/lib/adminPush'
import { sendOrderConfirmationMail, sendShippedMail, safeMail } from '@/lib/orderMail'

// MPM'in PayTR callback'i ödeme sonrası burayı çağırır (admin push + müşteri sipariş özeti maili). Gizli anahtar gerekmez: bildirim yalnızca
// gerçekten ödenmiş (status ödendi) ve daha önce bildirilmemiş siparişler için, bir kez gider.
export async function POST(req: Request) {
  const { orderNumber } = (await req.json().catch(() => ({}))) as { orderNumber?: string }
  if (!orderNumber || !/^(ORD\d{10,20}|MPM\d{6,12})$/.test(orderNumber)) {
    return NextResponse.json({ error: 'Geçersiz sipariş no' }, { status: 400 })
  }
  try {
    await notifyPaidOrder(orderNumber)
    await safeMail(() => sendOrderConfirmationMail(orderNumber))
  } catch (e) {
    console.error('order-paid push error:', e)
  }
  return NextResponse.json({ ok: true })
}
