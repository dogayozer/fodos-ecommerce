import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { syncMarketplaceAccount } from '@/lib/marketplaces/sync'

// Vercel Cron tarafından çağrılır (bkz. vercel.json — Vercel Pro aboneliği
// aktifleşince eklenecek, Plan Faz 2). /api/cron/* src/middleware.ts'in
// matcher'ının DIŞINDA olduğu için burada kendi auth kontrolümüzü yapıyoruz.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const accounts = await prisma.marketplaceAccount.findMany({ where: { isActive: true } })

  const results = []
  for (const account of accounts) {
    // Her hesap ayrı try/catch içinde (syncMarketplaceAccount zaten hatayı yutup
    // SyncResult olarak döndürüyor) — bir hesabın hatası diğerlerini etkilemez.
    const result = await syncMarketplaceAccount(account)
    results.push(result)
  }

  return NextResponse.json({
    syncedAccounts: results.length,
    succeeded: results.filter((r) => r.status === 'success').length,
    failed: results.filter((r) => r.status === 'failed').length,
    results,
  })
}
