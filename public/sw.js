// Service Worker para notificações Web Push
self.addEventListener('push', function(event) {
  let data = { title: 'NeuroTracker', body: 'Lembrete de Autocuidado' };
  try {
    data = event.data.json();
  } catch (e) {
    data = { title: 'NeuroTracker', body: event.data.text() };
  }

  const options = {
    body: data.body,
    icon: '/assets/prisma-icon.png',
    badge: '/assets/prisma-icon.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
