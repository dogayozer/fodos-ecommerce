import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        customer: true,
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return NextResponse.json(orders)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const {
      id,
      status,
      trackingNumber,
      shippingCompany,
      adminNote,
      invoiceStatus,
      invoiceNumber,
      invoiceUrl,
      taxNumber,
      taxOffice,
      companyTitle
    } = body

    if (!id) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 })
    }

    const updateData: any = {
      status,
      trackingNumber,
      shippingCompany,
      adminNote
    }

    if (invoiceStatus !== undefined) updateData.invoiceStatus = invoiceStatus
    if (invoiceNumber !== undefined) updateData.invoiceNumber = invoiceNumber
    if (invoiceUrl !== undefined) updateData.invoiceUrl = invoiceUrl
    if (invoiceStatus === 'invoiced' && !invoiceNumber) {
      updateData.invoicedAt = new Date()
    }
    if (taxNumber !== undefined) updateData.taxNumber = taxNumber
    if (taxOffice !== undefined) updateData.taxOffice = taxOffice
    if (companyTitle !== undefined) updateData.companyTitle = companyTitle

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({ success: true, order: updatedOrder })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
