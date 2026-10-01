import { prisma } from '@/lib/prisma'

// Müşteri mailleri Resend ile gider (RESEND_API_KEY Vercel env'inde). Anahtar yoksa sessizce atlanır.
// Gönderen adresler, Resend'de doğrulanmış alan adlarına ait olmalı.
const BRANDS = {
  fodos: { name: 'Fodos', from: 'Fodos <siparis@fodos.com.tr>', site: 'https://www.fodos.com.tr', support: 'destek@fodos.com.tr', color: '#ea580c' },
  mpm: { name: 'Mobil Parça Merkezi', from: 'Mobil Parça Merkezi <siparis@mobilparcamerkezi.com>', site: 'https://www.mobilparcamerkezi.com', support: 'destek@mobilparcamerkezi.com', color: '#ea580c' },
}

const HEPSIJET_TRACK_URL = 'https://www.hepsijet.com/'
const PAID = ['processing', 'in_progress', 'shipped', 'delivered']

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const tl = (n: number) => `${n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL`

async function sendMail(from: string, to: string, subject: string, html: string) {
  const key = process.env.RESEND_API_KEY
  if (!key) return false
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [to], subject, html }),
    signal: AbortSignal.timeout(8000),
  })
  if (!res.ok) throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 200)}`)
  return true
}

function layout(brand: (typeof BRANDS)['fodos'], title: string, body: string) {
  return `<div style="background:#f5f5f5;padding:24px 12px;font-family:Arial,Helvetica,sans-serif;color:#222">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e5e5">
<div style="background:${brand.color};color:#fff;padding:18px 24px;font-size:20px;font-weight:bold">${brand.name}</div>
<div style="padding:24px"><h2 style="margin:0 0 12px;font-size:18px">${title}</h2>${body}
<p style="margin:24px 0 0;font-size:12px;color:#777">Sorularınız için ${brand.support} adresine yazabilir veya <a href="${brand.site}" style="color:${brand.color}">${brand.site.replace('https://', '')}</a> üzerinden bize ulaşabilirsiniz.</p>
</div></div></div>`
}

async function loadOrder(orderNumber: string) {
  return prisma.order.findUnique({
    where: { orderNumber },
    include: { customer: { select: { name: true, email: true } }, items: { include: { product: { select: { title: true } } } } },
  })
}

const realEmail = (e?: string | null) => (e && !e.startsWith('guest_') ? e : null)

// Ödemesi alınan siparişin özetini müşteriye yollar; sipariş başına bir kez (confirmMailAt atomik işaretlenir).
// Son 30 dakikada güncellenmemiş siparişler için gönderilmez (herkese açık tetik ucuna karşı).
export async function sendOrderConfirmationMail(orderNumber: string) {
  if (!process.env.RESEND_API_KEY) return
  const claimed = await prisma.order.updateMany({
    where: { orderNumber, confirmMailAt: null, status: { in: PAID }, updatedAt: { gte: new Date(Date.now() - 30 * 60 * 1000) } },
    data: { confirmMailAt: new Date() },
  })
  if (claimed.count !== 1) return
  const order = await loadOrder(orderNumber)
  const to = realEmail(order?.customer?.email)
  if (!order || !to) return
  const brand = BRANDS[order.store === 'mpm' ? 'mpm' : 'fodos']

  const rows = order.items
    .map(
      (i) => `<tr><td style="padding:8px 0;border-bottom:1px solid #eee">${esc(i.product.title)}<br><span style="color:#777;font-size:12px">${i.quantity} adet × ${tl(i.price)}</span></td><td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;white-space:nowrap">${tl(i.price * i.quantity)}</td></tr>`
    )
    .join('')
  const line = (label: string, v: string, bold = false) =>
    `<tr><td style="padding:4px 0;${bold ? 'font-weight:bold;' : ''}">${label}</td><td style="padding:4px 0;text-align:right;${bold ? 'font-weight:bold;' : ''}">${v}</td></tr>`
  const addr = [order.shippingAddress, order.shippingDistrict, order.shippingCity].filter(Boolean).map((x) => esc(String(x))).join(', ')

  const html = layout(
    brand,
    'Siparişiniz alındı, teşekkür ederiz!',
    `<p style="margin:0 0 12px">Merhaba ${esc(order.customer?.name || '')},<br>ödemeniz onaylandı ve siparişiniz hazırlanmaya başlandı. Sipariş özetiniz:</p>
<p style="margin:0 0 8px"><b>Sipariş No:</b> ${order.orderNumber}<br><b>Tarih:</b> ${order.createdAt.toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul', dateStyle: 'short', timeStyle: 'short' })}</p>
<table style="width:100%;border-collapse:collapse;font-size:14px">${rows}</table>
<table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:8px">
${order.discountApplied > 0 ? line('İndirim', '-' + tl(order.discountApplied)) : ''}
${line('Kargo', order.shippingCost > 0 ? tl(order.shippingCost) : 'Ücretsiz')}
${line('Toplam', tl(order.totalAmount), true)}</table>
${addr ? `<p style="margin:16px 0 0;font-size:14px"><b>Teslimat adresi:</b><br>${addr}</p>` : ''}
<p style="margin:16px 0 0;font-size:14px">Siparişiniz kargoya verildiğinde takip bilgisiyle birlikte ayrıca haber vereceğiz.</p>`
  )
  await sendMail(brand.from, to, `Siparişiniz alındı — ${order.orderNumber}`, html)
}

// Sipariş "Kargolandı" (veya doğrudan "Teslim Edildi") olduğunda kargo bilgisini müşteriye yollar; bir kez.
export async function sendShippedMail(orderNumber: string) {
  if (!process.env.RESEND_API_KEY) return
  const claimed = await prisma.order.updateMany({
    where: { orderNumber, shippedMailAt: null, status: { in: ['shipped', 'delivered'] } },
    data: { shippedMailAt: new Date() },
  })
  if (claimed.count !== 1) return
  const order = await loadOrder(orderNumber)
  const to = realEmail(order?.customer?.email)
  if (!order || !to) return
  const brand = BRANDS[order.store === 'mpm' ? 'mpm' : 'fodos']
  const isHepsijet = (order.shippingCompany || '').toLowerCase().includes('hepsijet')

  const html = layout(
    brand,
    'Siparişiniz kargoya verildi',
    `<p style="margin:0 0 12px">Merhaba ${esc(order.customer?.name || '')},<br><b>${order.orderNumber}</b> numaralı siparişiniz kargoya verildi.</p>
<table style="font-size:14px;border-collapse:collapse">
${order.shippingCompany ? `<tr><td style="padding:4px 16px 4px 0;color:#777">Kargo firması</td><td><b>${esc(order.shippingCompany)}</b></td></tr>` : ''}
${order.trackingNumber ? `<tr><td style="padding:4px 16px 4px 0;color:#777">Takip no</td><td><b>${esc(order.trackingNumber)}</b></td></tr>` : ''}
</table>
${isHepsijet ? `<p style="margin:16px 0"><a href="${HEPSIJET_TRACK_URL}" style="display:inline-block;background:${brand.color};color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;font-weight:bold">Kargomu Takip Et</a></p><p style="margin:0;font-size:12px;color:#777">HepsiJET sitesinde gönderi takibi bölümüne yukarıdaki takip numarasını girerek kargonuzu izleyebilirsiniz.</p>` : ''}`
  )
  await sendMail(brand.from, to, `Siparişiniz kargoya verildi — ${order.orderNumber}`, html)
}

// Hata ödeme/kargo akışını bozmasın diye sarmalayıcı
export async function safeMail(fn: () => Promise<void>) {
  try { await fn() } catch (e) { console.error('Müşteri maili gönderilemedi:', e) }
}
