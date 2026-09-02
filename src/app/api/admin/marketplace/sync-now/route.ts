import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { syncMarketplaceAccount } from '@/lib/marketplaces/sync'

// Admin panelinden manuel tetiklenen tek-hesap senkronu — Plan Faz 1 POC testi
// ve ileride "şimdi yenile" butonu için. Cron devreye girene kadar (Vercel Pro
// aboneliği bekleniyor) bu, tek veri çekme yolu.
export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const accountId = searchParams.get('accountId')

  if (!accountId) {
    return NextResponse.json({ error: 'accountId query param zorunlu' }, { status: 400 })
  }

  const account = await prisma.marketplaceAccount.findUnique({ where: { id: accountId } })
  if (!account) {
    return NextResponse.json({ error: 'Hesap bulunamadı' }, { status: 404 })
  }

  const result = await syncMarketplaceAccount(account)
  return NextResponse.json(result, { status: result.status === 'success' ? 200 : 502 })
}
