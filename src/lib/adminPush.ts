import webpush from 'web-push'
import { prisma } from '@/lib/prisma'

// Anahtarlar Vercel env'inde: NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY. Yoksa bildirim sessizce atlanır.
function configure() {
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const priv = process.env.VAPID_PRIVATE_KEY
  if (!pub || !priv) return false
  webpush.setVapidDetails('mailto:destek@fodos.com.tr', pub, priv)
  return true
}

const PAID = ['processing', 'in_progress', 'shipped', 'delivered']

// Ödemesi alınan siparişi admin telefonlarına bildirir. Sipariş başına yalnızca bir kez gönderir
// (PayTR callback tekrarları ve herkese açık tetik ucu için): adminNotifiedAt atomik olarak işaretlenir;
// son 30 dakikada güncellenmemiş eski siparişler için bildirim gönderilmez.
export async function notifyPaidOrder(orderNumber: string) {
  if (!configure()) return
  const claimed = await prisma.order.updateMany({
    where: { orderNumber, adminNotifiedAt: null, status: { in: PAID }, updatedAt: { gte: new Date(Date.now() - 30 * 60 * 1000) } },
    data: { adminNotifiedAt: new Date() },
  })
  if (claimed.count !== 1) return

  const [order, subs] = await Promise.all([
    prisma.order.findUnique({
      where: { orderNumber },
      select: { orderNumber: true, totalAmount: true, shippingCity: true, store: true },
    }),
    prisma.adminPushSubscription.findMany(),
  ])
  if (!order || subs.length === 0) return

  const payload = JSON.stringify({
    title: `Yeni sipariş (${order.store === 'mpm' ? 'MPM' : 'Fodos'})`,
    body: `${order.totalAmount.toLocaleString('tr-TR')} TL${order.shippingCity ? ` • ${order.shippingCity}` : ''} • ${order.orderNumber}`,
    tag: order.orderNumber,
    url: '/admin/siparisler',
  })

  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload)
      } catch (e: any) {
        if (e?.statusCode === 404 || e?.statusCode === 410) {
          await prisma.adminPushSubscription.deleteMany({ where: { endpoint: s.endpoint } })
        } else {
          console.error('Push gönderilemedi:', e?.statusCode || e?.message)
        }
      }
    })
  )
}
