// Fodos Admin — yeni sipariş bildirimi (web push) için; önbellekleme yapmaz.
// Chrome'un "uygulamayı yükle" ölçütü fetch işleyicisi aradığı için sayfa istekleri doğrudan ağa iletilir.
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(() => new Response('Bağlantı yok. İnternete bağlanıp tekrar deneyin.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } })))
  }
})

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
