import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateBirfatura, findOrderByBirfaturaId, parseBirfaturaDate, readJsonBody } from '@/lib/birfatura'

// BirFatura: body { orderId, faturaUrl, faturaNo?, faturaTarihi? }
export async function POST(req: Request) {
  try {
    if (!(await authenticateBirfatura(req))) {
      return NextResponse.json({ status: false, error: 'Unauthorized. Geçersiz veya eksik API Anahtarı.' }, { status: 200 })
    }

    const body = await readJsonBody(req)
    const order = await findOrderByBirfaturaId(body.orderId)
    if (!order) {
      return NextResponse.json({ status: false, error: 'Belirtilen sipariş bulunamadı.' }, { status: 200 })
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        invoiceStatus: 'invoiced',
        invoiceFailReason: null,
        invoicedAt: parseBirfaturaDate(body.faturaTarihi) ?? new Date(),
        ...(body.faturaUrl ? { invoiceUrl: String(body.faturaUrl) } : {}),
        ...(body.faturaNo ? { invoiceNumber: String(body.faturaNo) } : {}),
      },
    })
    return NextResponse.json({ status: true })
  } catch (error: any) {
    console.error('BirFatura invoice link update error:', error)
    return NextResponse.json({ status: false, error: error.message }, { status: 200 })
  }
}
