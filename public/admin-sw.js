// Fodos Admin — yalnızca yeni sipariş bildirimi (web push) için; önbellekleme yapmaz.
self.addEventListener('push', (event) => {
  let data = {}
  try { data = event.data ? event.data.json() : {} } catch {}
  event.waitUntil(
    self.registration.showNotification(data.title || 'Yeni sipariş', {
      body: data.body || '',
      icon: '/admin-icon-192.png',
      badge: '/admin-icon-192.png',
      tag: data.tag || 'order',
      data: { url: data.url || '/admin/siparisler' },
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = (event.notification.data && event.notification.data.url) || '/admin/siparisler'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if (c.url.includes('/admin') && 'focus' in c) { c.navigate(url); return c.focus() }
      }
      return self.clients.openWindow(url)
    })
  )
})
