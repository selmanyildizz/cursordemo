/* eslint-disable no-restricted-globals */
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.1.5/workbox-sw.js');

const CACHE_NAME = 'earthquake-tracker-v1';
const OFFLINE_URL = '/offline.html';
const OFFLINE_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/static/js/main.chunk.js',
  '/static/js/bundle.js',
  '/static/css/main.chunk.css',
  '/manifest.json',
  '/logo192.png',
  '/logo512.png',
  '/favicon.ico'
];

// Offline sayfası için HTML
const OFFLINE_HTML = `
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Çevrimdışı - Deprem Takip</title>
    <style>
        body { font-family: system-ui; padding: 20px; text-align: center; }
        .offline-message { margin: 20px; }
        .retry-button {
            padding: 10px 20px;
            background: #48bb78;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <h1>Çevrimdışı Modu</h1>
    <div class="offline-message">
        <p>İnternet bağlantısı yok. Önceden kaydedilmiş veriler gösteriliyor.</p>
        <button class="retry-button" onclick="window.location.reload()">Yeniden Dene</button>
    </div>
</body>
</html>
`;

self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => {
        // Offline assets'leri önbelleğe al
        return cache.addAll(OFFLINE_ASSETS);
      }),
      // Offline HTML'i önbelleğe al
      caches.open(CACHE_NAME).then((cache) => {
        const offlineResponse = new Response(OFFLINE_HTML, {
          headers: { 'Content-Type': 'text/html' }
        });
        return cache.put(OFFLINE_URL, offlineResponse);
      })
    ])
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Sadece GET isteklerini yakala
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response; // Cache'den yanıt ver
        }

        return fetch(event.request)
          .then((response) => {
            // Geçerli bir yanıt yoksa offline sayfasını göster
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return caches.match(OFFLINE_URL);
            }

            // Yanıtı önbelleğe al ve döndür
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Ağ hatası durumunda offline sayfasını göster
            return caches.match(OFFLINE_URL);
          });
      })
  );
});

// Background sync için
const bgSyncPlugin = new workbox.backgroundSync.BackgroundSyncPlugin('offlineQueue', {
  maxRetentionTime: 24 * 60 // 24 saat
});

// Offline harita için tile'ları önbelleğe al
workbox.routing.registerRoute(
  ({url}) => url.href.includes('tile.openstreetmap.org'),
  new workbox.strategies.CacheFirst({
    cacheName: 'map-tiles',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 1000,
        maxAgeSeconds: 30 * 24 * 60 * 60 // 30 gün
      })
    ]
  })
);

// API isteklerini önbelleğe al
workbox.routing.registerRoute(
  ({url}) => url.href.includes('api.orhanaydogdu.com.tr'),
  new workbox.strategies.NetworkFirst({
    cacheName: 'api-cache',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 5 * 60 // 5 dakika
      })
    ]
  })
); 