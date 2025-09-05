
const CACHE_NAME = "preventivo-app-cache-v1";
const urlsToCache = [
  "index.html",
  "style.css",
  "script.js",
  "pdf-export.js",
  "icon-192.png",
  "icon-512.png",
  "manifest.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
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
