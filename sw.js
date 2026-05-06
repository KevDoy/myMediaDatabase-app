/* ============================================================
   My Media DB — Service Worker
   Cache-first strategy for app shell, network-first for data
   ============================================================ */

const CACHE_NAME = 'my-media-db-v2';

const APP_SHELL = [
  '/',
  '/index.html',
  '/manage.html',
  '/assets/css/style.css',
  '/assets/js/app.js',
  '/assets/js/manage.js',
  '/assets/vendor/bootstrap/css/bootstrap.min.css',
  '/assets/vendor/bootstrap/js/bootstrap.bundle.min.js',
  '/assets/vendor/bootstrap-icons/font/bootstrap-icons.min.css',
  '/assets/vendor/bootstrap-icons/font/fonts/bootstrap-icons.woff2',
  '/assets/vendor/bootstrap-icons/font/fonts/bootstrap-icons.woff',
  '/manifest.json',
];

// Install: cache the app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: network-first for data files, cache-first for everything else
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Network-first for JSON data so the library stays fresh
  if (url.pathname.startsWith('/data/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-first for app shell and static assets
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        // Cache successful same-origin responses
        if (response.ok && url.origin === location.origin) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
