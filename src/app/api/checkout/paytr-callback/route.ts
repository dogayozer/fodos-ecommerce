import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { sendHepsijetOrder } from '@/lib/hepsijet'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    
    const merchant_oid = formData.get('merchant_oid') as string
    const status = formData.get('status') as string
    const total_amount = formData.get('total_amount') as string
    const hash = formData.get('hash') as string
    const failed_reason_code = formData.get('failed_reason_code') as string
    const failed_reason_msg = formData.get('failed_reason_msg') as string

    if (!merchant_oid || !status || !hash) {
      return new NextResponse('Bad Request', { status: 400 })
    }

    const merchant_key = (process.env.PAYTR_MERCHANT_KEY || '8Znf7RgqbWaar2B5').trim()
    const merchant_salt = (process.env.PAYTR_MERCHANT_SALT || 'iF9zPQq1UbZ4Xoeo').trim()

    // Hash doğrulaması (PayTR'dan geldiğini kanıtlamak için)
    const expected_hash_str = merchant_oid + merchant_salt + status + total_amount
    const expected_hash = crypto.createHmac('sha256', merchant_key).update(expected_hash_str).digest('base64')

    if (hash !== expected_hash) {
      console.error('PayTR Callback Hash Mismatch!')
      return new NextResponse('OK', { status: 200 }) // PayTR expects OK even if hash fails to stop retries, or we can return 400
    }

    if (status === 'success') {
      const existingOrder = await prisma.order.findUnique({
        where: { orderNumber: merchant_oid },
        select: { status: true }
      })
      
      // Sadece 'pending' veya 'cancelled' ise 'processing' yap.
      // Eğer admin zaten 'shipped' veya 'delivered' yaptıysa PayTR webhook'u bunu geri almasın!
      if (existingOrder && (existingOrder.status === 'pending' || existingOrder.status === 'cancelled')) {
        await prisma.order.update({
          where: { orderNumber: merchant_oid },
          data: { status: 'processing' }
        })

        // Ödeme onaylandığı an HepsiJET'e otomatik gönderi oluştur (STD). Bu adım asla
        // ödeme webhook'unun PayTR'a "OK" dönmesini engellememeli — hata olursa sadece
        // logla, sipariş "processing" kalır, admin panelinden manuel tekrar denenebilir.
        try {
          const fullOrder = await prisma.order.findUnique({
            where: { orderNumber: merchant_oid },
            include: { customer: true }
          })
          if (fullOrder && !fullOrder.trackingNumber) {
            const result = await sendHepsijetOrder({
              orderNumber: fullOrder.orderNumber,
              customerName: fullOrder.customer?.name || 'Misafir Müşteri',
              customerPhone: fullOrder.customer?.phone || '',
              customerEmail: fullOrder.customer?.email,
              shippingCity: fullOrder.shippingCity || '',
              shippingDistrict: fullOrder.shippingDistrict || '',
              shippingAddress: fullOrder.shippingAddress || '',
            })
            if (result.success) {
              await prisma.order.update({
                where: { orderNumber: merchant_oid },
                data: {
                  trackingNumber: result.trackingNumber,
                  shippingCompany: 'HepsiJET',
                }
              })
            } else {
              console.error('HepsiJET gönderi oluşturma hatası:', result.error)
            }
          }
        } catch (hepsijetError) {
          console.error('HepsiJET entegrasyon hatası:', hepsijetError)
        }
      }
    } else {
      const existingOrder = await prisma.order.findUnique({
        where: { orderNumber: merchant_oid },
        select: { status: true }
      })
      
      if (existingOrder && existingOrder.status === 'pending') {
        await prisma.order.update({
          where: { orderNumber: merchant_oid },
          data: {
            status: 'cancelled',
            adminNote: `PayTR Ödeme Başarısız: ${failed_reason_msg} (Kod: ${failed_reason_code})`,
          }
        })
      }
      console.error('PayTR Payment Failed:', failed_reason_code, failed_reason_msg)
    }

    return new NextResponse('OK', { status: 200 })

  } catch (error) {
    console.error('PayTR Callback Error:', error)
    return new NextResponse('OK', { status: 200 })
  }
}
