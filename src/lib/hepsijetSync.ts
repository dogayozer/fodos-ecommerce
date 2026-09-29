import { prisma } from '@/lib/prisma'
import { getHepsijetTracking, orderStatusFromTracking, HEPSIJET_IS_TEST } from '@/lib/hepsijet'

// HepsiJET gönderilerini sorgular: kurye paketi aldıysa "Kargolandı", teslim ettiyse "Teslim Edildi" yapar.
// Hem admin düğmesi/sayfa açılışı hem de günlük zamanlanmış görev (api/cron/hepsijet-sync) kullanır.
export async function syncHepsijetOrders() {
  const orders = await prisma.order.findMany({
    where: {
      shippingCompany: 'HepsiJET',
      trackingNumber: { not: null },
      status: { in: ['processing', 'in_progress', 'shipped'] },
    },
    select: { id: true, orderNumber: true, status: true, trackingNumber: true },
  })

  const updated: { orderNumber: string; from: string; to: string; last: string | null }[] = []
  const errors: string[] = []

  // Sırayla: az sayıda gönderi var, Prisma havuzunu ve HepsiJET'i yormamak için paralel yok
  for (const order of orders) {
    try {
      const tracking = await getHepsijetTracking(order.trackingNumber!)
      if (!tracking) {
        errors.push(order.orderNumber)
        continue
      }
      const next = orderStatusFromTracking(order.status, tracking)
      if (next) {
        await prisma.order.update({ where: { id: order.id }, data: { status: next } })
        updated.push({ orderNumber: order.orderNumber, from: order.status, to: next, last: tracking.lastTransaction })
      }
    } catch {
      errors.push(order.orderNumber)
    }
  }

  return { checked: orders.length, updated, errors, test: HEPSIJET_IS_TEST }
}
