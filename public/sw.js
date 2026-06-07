const CACHE_NAME = 'portfoliofy-cache-v1';

// Add core assets to cache
const urlsToCache = ['/', '/logo.png', '/favicon.ico'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    }),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name)),
      );
    }),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only cache GET requests
  if (event.request.method !== 'GET') return;

  // Network first strategy for API routes and dynamic pages
  // We don't want to serve stale data for a live database-driven app
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If it's a valid response from same origin, clone and cache it
        // Only caching static assets (images, css, js)
        if (
          response &&
          response.status === 200 &&
          response.type === 'basic' &&
          event.request.url.match(/\.(css|js|png|jpg|jpeg|svg|woff2?|ico)$/i)
        ) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache if offline
        return caches.match(event.request);
      }),
  );
});

// Push notification event listener (optional, set up for future)
self.addEventListener('push', function (event) {
  if (event.data) {
    try {
      const data = event.data.json();
      const options = {
        body: data.body,
        icon: data.icon || '/icon-192x192.png',
        badge: '/icon-192x192.png',
        vibrate: [100, 50, 100],
        data: {
          dateOfArrival: Date.now(),
          primaryKey: '1',
        },
      };
      event.waitUntil(self.registration.showNotification(data.title, options));
    } catch (e) {
      console.error('Push event data was not JSON');
    }
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(clients.openWindow('https://portfoliofy.me'));
});
