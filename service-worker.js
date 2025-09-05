const CACHE_NAME = "preventivo-app-cache-v1";
const urlsToCache = [
  "/index.html",
  "/abbigliamento.html",
  "/style.css",
  "/script.js",
  "/autocomplete.js",
  "/pdf-export.js",
  "/icon-192.png",
  "/icon-512.png",
  "/manifest.json"
];

// Installazione e cache iniziale
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .catch(err => console.warn("⚠️ Alcuni file non sono stati cacheati:", err))
  );
  self.skipWaiting();
});

// Attivazione → pulizia cache vecchie
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch → prima cerca in cache, poi rete
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
      .catch(err => console.error("❌ Errore fetch SW:", err))
  );
});
