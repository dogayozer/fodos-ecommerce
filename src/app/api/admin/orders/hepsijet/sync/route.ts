import { NextResponse } from 'next/server'
import { syncHepsijetOrders } from '@/lib/hepsijetSync'

// Admin: HepsiJET durumlarını hemen güncelle (/api/admin/* middleware ile korunuyor).
// Günlük otomatik çalışma için bkz. api/cron/hepsijet-sync.
export async function POST() {
  try {
    return NextResponse.json(await syncHepsijetOrders())
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
