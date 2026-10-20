import { prisma } from '@/lib/prisma'
import { notifyAdmin } from '@/lib/adminPush'
import { sendLicenseMail, safeMail } from '@/lib/orderMail'

// Dijital ürün (kucukis.com uygulamaları) satış anında lisans anahtarı üretimi.
// kucukis.com tarafı sözleşmesi: POST /api/lisans/ver { product, ref, count, customer } + Bearer LISANS_ISSUE_TOKEN;
// aynı ref+product tekrar çağrılırsa aynı anahtarlar döner (idempotent). Token yoksa tüm akış sessizce atlanır.
const ISSUE_URL = 'https://kucukis.com/api/lisans/ver'
const PAID = ['processing', 'in_progress', 'shipped', 'delivered']
const MAX_PER_ITEM = 5

const PRODUCT_BY_BARCODE: Record<string, string> = {
  'KUCUKIS-BARKODLU-SATIS-01': 'satis',
  'KUCUKIS-KARGO-KOLAY-MOBIL-01': 'mobil',
  'KUCUKIS-SERVIS-OTO-TAMIR-01': 'tamir',
  'KUCUKIS-OTOPARK-YIKAMA-01': 'otopark',
  'KUCUKIS-APARTMAN-YONETIM-01': 'apartman',
  'KUCUKIS-GUVENLIK-KOLAY-01': 'guvenlik',
}

type IssueOptions = { requireFresh?: boolean }

async function noteAndAlert(orderId: string, orderNumber: string, msg: string) {
  const o = await prisma.order.findUnique({ where: { id: orderId }, select: { adminNote: true } })
  const stamp = new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul', dateStyle: 'short', timeStyle: 'short' })
  await prisma.order.update({
    where: { id: orderId },
    data: { adminNote: [o?.adminNote, `[${stamp}] Lisans: ${msg}`].filter(Boolean).join('\n') },
  })
  await notifyAdmin('Lisans anahtarı sorunu', `${orderNumber}: ${msg}`, `lic-${orderNumber}`).catch(() => {})
}

// Ödemesi alınmış siparişteki dijital kalemler için anahtar üretir, saklar ve müşteriye mail atar. Sipariş başına tek sefer
// (licenseIssuedAt atomik claim); hata olursa claim geri alınır, adminNote + admin bildirimi düşer ve yeniden denenebilir.
export async function issueLicensesForOrder(orderNumber: string, opts: IssueOptions = {}): Promise<{ ok: boolean; reason?: string }> {
  const token = process.env.LISANS_ISSUE_TOKEN
  if (!token) return { ok: false, reason: 'LISANS_ISSUE_TOKEN tanımlı değil' }

  const claimed = await prisma.order.updateMany({
    where: {
      orderNumber,
      licenseIssuedAt: null,
      status: { in: PAID },
      ...(opts.requireFresh ? { updatedAt: { gte: new Date(Date.now() - 30 * 60 * 1000) } } : {}),
    },
    data: { licenseIssuedAt: new Date() },
  })
  if (claimed.count !== 1) return { ok: false, reason: 'claim alınamadı (zaten verilmiş / ödenmemiş / eski)' }

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      customer: { select: { name: true } },
      items: { include: { product: { select: { barcode: true, category: { select: { slug: true } } } } } },
    },
  })
  if (!order) return { ok: false, reason: 'sipariş yok' }

  const digital = order.items.filter((i) => i.product.category?.slug === 'yazilim' && PRODUCT_BY_BARCODE[i.product.barcode])
  if (digital.length === 0) {
    // dijital kalem yok: claim'i geri al (başka akışı engellemesin)
    await prisma.order.update({ where: { id: order.id }, data: { licenseIssuedAt: null } })
    return { ok: false, reason: 'dijital kalem yok' }
  }

  const failures: string[] = []
  for (const item of digital) {
    const product = PRODUCT_BY_BARCODE[item.product.barcode]
    if (item.quantity > MAX_PER_ITEM) {
      failures.push(`${product}: adet ${item.quantity} > ${MAX_PER_ITEM}, anahtarları elle verin`)
      continue
    }
    try {
      const res = await fetch(ISSUE_URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ product, ref: order.orderNumber, count: item.quantity, customer: order.customer?.name || 'Müşteri' }),
        signal: AbortSignal.timeout(10000),
      })
      const json: any = await res.json().catch(() => null)
      if (!res.ok || !json?.ok || !Array.isArray(json.keys) || json.keys.length === 0) {
        failures.push(`${product}: HTTP ${res.status}`)
        continue
      }
      await prisma.licenseKey.createMany({
        data: json.keys.map((key: string) => ({ orderId: order.id, orderItemId: item.id, product, key })),
        skipDuplicates: true,
      })
    } catch (e: any) {
      failures.push(`${product}: ${e?.message || 'bağlantı hatası'}`)
    }
  }

  if (failures.length > 0) {
    // başarısız: yeniden denenebilsin (idempotent uç aynı anahtarları döner); müşteriye mail gitmez
    await prisma.order.update({ where: { id: order.id }, data: { licenseIssuedAt: null } })
    await noteAndAlert(order.id, order.orderNumber, `anahtar alınamadı (${failures.join('; ')}). Siparişi elle tamamlayın ya da admin ekranından yeniden deneyin.`)
    return { ok: false, reason: failures.join('; ') }
  }

  await safeMail(async () => {
    await sendLicenseMail(order.orderNumber)
  })
  return { ok: true }
}
