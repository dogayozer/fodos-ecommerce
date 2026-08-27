import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

import { timingSafeEqual } from 'crypto'

/**
 * BirFatura Fatura / Kargo Durumu Güncelleme Webhook Endpoint'i
 * POST /api/birfatura/update-status
 */
async function authenticateRequest(req: Request): Promise<boolean> {
  const url = new URL(req.url)
  const authHeader = req.headers.get('authorization')
  const apiKeyHeader = req.headers.get('x-api-key') || req.headers.get('x-token')
  const queryToken = url.searchParams.get('token') || url.searchParams.get('apiKey') || url.searchParams.get('key')

  let providedToken = queryToken || apiKeyHeader

  if (authHeader && authHeader.startsWith('Bearer ')) {
    providedToken = authHeader.substring(7).trim()
  }

  const settings = await prisma.storeSettings.findUnique({
    where: { id: 'default' }
  })

  const validKey = settings?.birfaturaApiKey || process.env.BIRFATURA_API_KEY || 'fodos_bf_live_key_2026'

  if (!providedToken) {
    return false
  }

  try {
    const providedBuffer = Buffer.from(providedToken)
    const validBuffer = Buffer.from(validKey)
    if (providedBuffer.length !== validBuffer.length) {
      return false
    }
    return timingSafeEqual(providedBuffer, validBuffer)
  } catch (e) {
    return false
  }
}

export async function POST(req: Request) {
  try {
    const isAuth = await authenticateRequest(req)
    if (!isAuth) {
      return NextResponse.json(
        { status: false, error: 'Unauthorized. Geçersiz veya eksik API Anahtarı.' },
        { status: 401 }
      )
    }

    const body = await req.json()

    // BirFatura'dan gelebilecek olası parametre anahtarları
    const orderId = body.order_id || body.orderId || body.id
    const orderNumber = body.order_number || body.orderNumber || body.siparis_no
    const invoiceNumber = body.invoice_number || body.invoiceNumber || body.fatura_no || body.faturaNo
    const invoiceUrl = body.invoice_url || body.invoiceUrl || body.fatura_url || body.pdf_url || body.faturaLink
    const invoiceDate = body.invoice_date || body.invoiceDate || body.fatura_tarihi
    const trackingNumber = body.tracking_number || body.trackingNumber || body.kargo_takip_no || body.takipNo
    const cargoCompany = body.cargo_company || body.shippingCompany || body.kargo_firmasi || body.kargo
    const newStatus = body.status || body.order_status

    if (!orderId && !orderNumber) {
      return NextResponse.json(
        { status: false, error: 'order_id veya order_number parametresi zorunludur.' },
        { status: 400 }
      )
    }

    // Siparişi bul
    const existingOrder = await prisma.order.findFirst({
      where: {
        OR: [
          ...(orderId ? [{ id: orderId }] : []),
          ...(orderNumber ? [{ orderNumber: String(orderNumber) }] : [])
        ]
      }
    })

    if (!existingOrder) {
      return NextResponse.json(
        { status: false, error: 'Belirtilen sipariş bulunamadı.' },
        { status: 404 }
      )
    }

    // Güncellenecek alanları hazırla
    const updateData: any = {}
    let adminNote = existingOrder.adminNote || ''

    if (invoiceNumber) {
      if (existingOrder.invoiceNumber && existingOrder.invoiceNumber !== String(invoiceNumber)) {
        adminNote += `\n[${new Date().toLocaleDateString('tr-TR')}] Eski fatura no: ${existingOrder.invoiceNumber}, yeni fatura no: ${invoiceNumber}`
      }
      updateData.invoiceNumber = String(invoiceNumber)
      updateData.invoiceStatus = 'invoiced'
      updateData.invoicedAt = invoiceDate ? new Date(invoiceDate) : new Date()
    }

    if (invoiceUrl) {
      updateData.invoiceUrl = String(invoiceUrl)
      updateData.invoiceStatus = 'invoiced'
      if (!updateData.invoicedAt) {
        updateData.invoicedAt = new Date()
      }
    }

    if (trackingNumber) {
      updateData.trackingNumber = String(trackingNumber)
      // Kargo takip no girildiyse durumu kargolandı yapabiliriz
      if (existingOrder.status === 'pending' || existingOrder.status === 'processing') {
        updateData.status = 'shipped'
      }
    }

    if (cargoCompany) {
      updateData.shippingCompany = String(cargoCompany)
    }

    // Fatura iptal/hata durumu
    const invStatus = body.invoice_status || body.invoiceStatus
    if (invStatus && typeof invStatus === 'string' && invStatus.toLowerCase() === 'failed') {
      updateData.invoiceStatus = 'failed'
      updateData.invoiceFailReason = body.fail_reason || body.error_message || body.reason || 'Bilinmeyen hata'
    }

    if (newStatus && typeof newStatus === 'string') {
      const normalizedStatus = newStatus.toLowerCase()
      if (['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(normalizedStatus)) {
        updateData.status = normalizedStatus
      } else if (normalizedStatus === 'failed') {
        updateData.invoiceStatus = 'failed'
        updateData.invoiceFailReason = body.fail_reason || body.error_message || body.reason || 'Bilinmeyen hata'
      }
    }

    if (adminNote !== existingOrder.adminNote) {
      updateData.adminNote = adminNote.trim()
    }

    const updatedOrder = await prisma.order.update({
      where: { id: existingOrder.id },
      data: updateData
    })

    return NextResponse.json({
      status: true,
      message: 'Sipariş başarıyla güncellendi.',
      order: {
        id: updatedOrder.id,
        order_number: updatedOrder.orderNumber,
        status: updatedOrder.status,
        invoice_status: updatedOrder.invoiceStatus,
        invoice_number: updatedOrder.invoiceNumber,
        invoice_url: updatedOrder.invoiceUrl,
        tracking_number: updatedOrder.trackingNumber,
        shipping_company: updatedOrder.shippingCompany
      }
    })
  } catch (error: any) {
    console.error('BirFatura status update error:', error)
    return NextResponse.json({ status: false, error: error.message }, { status: 500 })
  }
}
