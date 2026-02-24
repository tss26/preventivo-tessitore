// AGGIORNATO: Cambia la versione per forzare l'aggiornamento della cache
const CACHE_NAME = "preventivo-app-cache-v63"; 

const urlsToCache = [
  "index.html",     // serve ancora
  "login.html",     // <--- AGGIUNTO: Fondamentale perché è il  nuovo start_url
  "cliente.js",       // <--- AGGIUNTO: Il tuo nuovo file script
  "cliente.css",
  "cliente.html",
  "operatore.html",
  "admin.html",
  "admin.js",
  "profilo.html",
  "profilo.js",
  "operatore.js",
  "style.css",
  "script.js",
  "pdf-export.js",
  "autocomplete.js",
  "icon-192.png",
  "manifest.json"
];

self.addEventListener("install", (event) => {
  // Forza il nuovo service worker a prendere il controllo immediatamente
  self.skipWaiting(); 
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Caching file app incluso login.html");
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("activate", (event) => {
  // Pulisce le vecchie cache (es. la v1) quando si attiva la v2
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Rimozione vecchia cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
