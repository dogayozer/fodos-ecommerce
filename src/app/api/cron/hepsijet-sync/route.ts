import { NextRequest, NextResponse } from 'next/server'
import { syncHepsijetOrders } from '@/lib/hepsijetSync'

export const maxDuration = 60

// Vercel Cron her akşam çağırır (bkz. vercel.json). /api/cron/* src/middleware.ts'in matcher'ının
// DIŞINDA olduğu için burada kendi auth kontrolümüzü yapıyoruz: Vercel, projede CRON_SECRET tanımlıysa
// isteğe otomatik `Authorization: Bearer <CRON_SECRET>` ekler.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'CRON_SECRET tanımlı değil' }, { status: 500 })
  }
  if (req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    return NextResponse.json(await syncHepsijetOrders())
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
