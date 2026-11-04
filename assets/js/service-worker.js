// ARCHIVO: service-worker.js (Este archivo va solo y separado)

const CACHE_NAME = 'my-cache-v1';

// Cache a response
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll([
          '/',
          '/index.html',
          '/css/style.css',
          '/main.js',
          '/class/Tasa.js',
          '/modules/DOMButtons.js',
          '/modules/DOMControler.js',
          '/modules/getData.js',
          '/modules/rateConverter.js',
          '/modules/shareURL.js',
          '/modules/localStorageManager.js', // <-- Corregido con la barra inicial
          '/data/tasas.json',
          '/icons/Logo_with_name.svg',
          '/icons/Logo.svg',
          '/android-chrome-192x192.png',
          '/android-chrome-512x512.png',
          '/apple-touch-icon.png',
          '/browserconfig.xml',
          '/favicon-16x16.png',
          '/favicon-32x32.png',
          '/favicon.ico',
          '/site.webmanifest'
        ]);
      })
      .then(() => self.skipWaiting())
  );
});

// Activar el Service Worker y limpiar cachés viejas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Borrando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Intercept fetch requests and serve from cache if available
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Si está en caché lo devuelve, si no, intenta buscarlo en la red
        return response || fetch(event.request).catch(() => {
          console.log("Estás offline y el recurso no está en caché");
        });
      })
  );
});