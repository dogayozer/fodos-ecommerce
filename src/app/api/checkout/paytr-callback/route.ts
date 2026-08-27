import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    
    const merchant_oid = formData.get('merchant_oid') as string
    const status = formData.get('status') as string
    const total_amount = formData.get('total_amount') as string
    const hash = formData.get('hash') as string
    const fail_reason = formData.get('fail_reason') as string

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
      }
    } else {
      const existingOrder = await prisma.order.findUnique({
        where: { orderNumber: merchant_oid },
        select: { status: true }
      })
      
      if (existingOrder && existingOrder.status === 'pending') {
        await prisma.order.update({
          where: { orderNumber: merchant_oid },
          data: { status: 'cancelled' }
        })
      }
      console.error('PayTR Payment Failed:', fail_reason)
    }

    return new NextResponse('OK', { status: 200 })

  } catch (error) {
    console.error('PayTR Callback Error:', error)
    return new NextResponse('OK', { status: 200 })
  }
}
