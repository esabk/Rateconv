// Register the service worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then(() => {
        console.log('Service worker registered.');
      })
      .catch((error) => {
        console.error('Error registering service worker:', error);
      });
  }
  
  // Cache a response
  self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open('my-cache')
        .then((cache) => {
          return cache.addAll([
            '/',
            '/css/style.css',                //Cs
            '/main.js',                       //Js
            '/class/Tasa.js',
            '/modules/DOMButtons.js',
            '/modules/DOMControler.js',
            '/modules/getData.js',
            '/modules/rateConverter.js',
            '/modules/shareURL.js',
            '/data/tasas.json',              //Data
            '/icons/Logo_with_name.svg',      //Icons
            '/icons/Logo.svg',
            'android-chrome-192x192.png',
            'android-chrome-512x512.png',
            'apple-touch-icon.png',
            'browserconfig.xml',
            'favicon-16x16.png',
            'favicon-32x32.png',
            'favicon.ico',
            'site.webmanifest',
            // Add other assets to cache here
          ]);
        })
    );
  });
  
  // Intercept fetch requests and serve from cache if available
  self.addEventListener('fetch', (event) => {
    //Avisa qu estás sin internet
    console.log("Estas offline")
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          return response || fetch(event.request);
        })
    );
  });
  