const CACHE_NAME = "preventivo-app-cache-v1";
const urlsToCache = [
  "/index.html",
  "/abbigliamento.html",
  "/style.css",
  "/js/script.js",
  "/js/autocomplete.js",
  "/js/pdf-export.js",
  "/img/icon-192.png",
  "/img/icon-512.png",
  "/manifest.json"
];

// Installazione e caching iniziale
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .catch(err => console.warn("⚠️ Alcuni file non sono stati cacheati:", err))
  );
  self.skipWaiting();
});

// Attivazione e pulizia cache vecchie
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Gestione fetch: cache-first con fallback online
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
      .catch(err => console.error("Errore fetch dal Service Worker:", err))
  );
});
