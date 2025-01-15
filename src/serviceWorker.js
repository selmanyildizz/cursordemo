import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { BackgroundSyncPlugin } from 'workbox-background-sync';
import { createHandlerBoundToURL } from 'workbox-precaching';

// Manifest dosyasını önbelleğe al
precacheAndRoute(self.__WB_MANIFEST);

// Offline harita için tile'ları önbelleğe alma
registerRoute(
  ({ url }) => url.href.includes('tile.openstreetmap.org'),
  new CacheFirst({
    cacheName: 'map-tiles',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 1000, // Maksimum 1000 tile
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 gün
      }),
    ],
  })
);

// Background sync için kuyruk oluştur
const bgSyncPlugin = new BackgroundSyncPlugin('offlineQueue', {
  maxRetentionTime: 24 * 60 // 24 saat
});

// Offline hasar raporları için sync
registerRoute(
  ({ url }) => url.pathname.includes('/api/damage-reports'),
  new NetworkFirst({
    plugins: [bgSyncPlugin],
  }),
  'POST'
);

// Push notification için event listener
self.addEventListener('push', (event) => {
  const options = {
    body: event.data.text(),
    icon: '/logo192.png',
    badge: '/logo192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      {
        action: 'explore',
        title: 'Detayları Gör',
      },
      {
        action: 'close',
        title: 'Kapat',
      },
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Deprem Bildirimi', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'explore') {
    clients.openWindow('/');
  }
}); 