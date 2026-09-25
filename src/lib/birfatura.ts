import { createHash, timingSafeEqual } from 'crypto'
import { prisma } from '@/lib/prisma'

// BirFatura özel entegrasyon sözleşmesi: swagger.json (proje kökü)

export const ORDER_STATUSES = [
  { Id: 1, Value: 'pending' },
  { Id: 2, Value: 'processing' },
  { Id: 3, Value: 'shipped' },
  { Id: 4, Value: 'delivered' },
  { Id: 5, Value: 'cancelled' },
  { Id: 6, Value: 'in_progress' },
]

export function statusFromId(id: unknown): string | null {
  return ORDER_STATUSES.find((s) => s.Id === Number(id))?.Value ?? null
}

export async function authenticateBirfatura(req: Request): Promise<boolean> {
  const url = new URL(req.url)
  const bearer = req.headers.get('authorization')
  const provided =
    req.headers.get('token') ||
    req.headers.get('x-token') ||
    req.headers.get('x-api-key') ||
    (bearer?.startsWith('Bearer ') ? bearer.substring(7).trim() : null) ||
    url.searchParams.get('token') ||
    url.searchParams.get('apiKey') ||
    url.searchParams.get('key')

  if (!provided) return false

  const settings = await prisma.storeSettings.findUnique({ where: { id: 'default' } })
  const validKey = settings?.birfaturaApiKey || process.env.BIRFATURA_API_KEY || 'fodos_bf_live_key_2026'

  const a = Buffer.from(provided)
  const b = Buffer.from(validKey)
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function readJsonBody(req: Request): Promise<Record<string, any>> {
  try {
    const body = await req.json()
    return body && typeof body === 'object' ? body : {}
  } catch {
    return {}
  }
}

// BirFatura OrderId'yi long bekliyor; sipariş numarasının rakam kısmı (ORD 15-16 hane, MPM 8-9 hane) benzersiz ve güvenli tam sayı.
export function orderNumericId(orderNumber: string): number {
  return Number(orderNumber.replace(/\D/g, ''))
}

export function orderNumberCandidates(orderId: unknown): string[] {
  const digits = String(orderId ?? '').replace(/\D/g, '')
  if (!digits) return []
  return [`ORD${digits}`, `MPM${digits.padStart(9, '0')}`, `MPM-${digits.padStart(8, '0')}`]
}

export function findOrderByBirfaturaId(orderId: unknown) {
  return prisma.order.findFirst({ where: { orderNumber: { in: orderNumberCandidates(orderId) } } })
}

// cuid'leri BirFatura'nın long beklediği alanlar için sabit bir tam sayıya çevirir (48 bit, JS'de güvenli).
export function stableNumericId(value: string): number {
  return parseInt(createHash('sha1').update(value).digest('hex').slice(0, 12), 16)
}

const istanbulParts = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Istanbul',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
})

export function formatBirfaturaDate(date: Date): string {
  const p = Object.fromEntries(istanbulParts.formatToParts(date).map((x) => [x.type, x.value]))
  return `${p.day}.${p.month}.${p.year} ${p.hour}:${p.minute}:${p.second}`
}

// "dd.MM.yyyy HH:mm:ss" (İstanbul saati, UTC+3)
export function parseBirfaturaDate(value: unknown): Date | null {
  if (typeof value !== 'string' || !value.trim()) return null
  const m = value.trim().match(/^(\d{2})\.(\d{2})\.(\d{4})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?$/)
  const date = m
    ? new Date(`${m[3]}-${m[2]}-${m[1]}T${m[4] ?? '00'}:${m[5] ?? '00'}:${m[6] ?? '00'}+03:00`)
    : new Date(value)
  return isNaN(date.getTime()) ? null : date
}
