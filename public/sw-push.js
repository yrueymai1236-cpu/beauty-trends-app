// Push event listener for TrendGlow PWA
self.addEventListener('push', event => {
  let data = { title: 'TrendGlow', body: '新しいトレンドコスメが更新されました！' };
  try {
    data = event.data ? event.data.json() : data;
  } catch (e) {
    data = { title: 'TrendGlow', body: event.data ? event.data.text() : data.body };
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icon-192x192.png',
    badge: '/icon-192x192.png',
    data: data.data || { url: '/' }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data ? event.notification.data.url : '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        // Focus if already open
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
