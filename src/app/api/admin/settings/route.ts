import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function GET(req: Request) {
  try {
    const settings = await prisma.storeSettings.findUnique({
      where: { id: 'default' }
    })
    return NextResponse.json({ settings: settings || {} })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const cookieStore: any = cookies()
  const store = cookieStore instanceof Promise ? await cookieStore : cookieStore
  const session = store.get('admin_session')
  
  if (session?.value !== 'authenticated') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const {
      companyName, address, phone, aboutUs,
      mesafeliSatisHtml, gizlilikGuvenlikHtml, iptalIadeHtml,
      kargoTakipHtml, kisiselVerilerHtml
    } = body

    const settings = await prisma.storeSettings.upsert({
      where: { id: 'default' },
      update: {
        companyName, address, phone, aboutUs,
        mesafeliSatisHtml, gizlilikGuvenlikHtml, iptalIadeHtml,
        kargoTakipHtml, kisiselVerilerHtml
      },
      create: {
        id: 'default',
        companyName, address, phone, aboutUs,
        mesafeliSatisHtml, gizlilikGuvenlikHtml, iptalIadeHtml,
        kargoTakipHtml, kisiselVerilerHtml
      }
    })

    revalidatePath('/', 'layout')

    return NextResponse.json({ success: true, settings })
  } catch (error: any) {
    console.error('Settings update error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
