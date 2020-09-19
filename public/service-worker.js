const FILES_TO_CACHE = [
  "/",
  "/styles.css",
  "/index.html",
  "/dist/bundle.js",
  "/dist/assets/icons/icon_96x96.png",
  "/dist/assets/icons/icon_128x128.png",
  "/dist/assets/icons/icon_192x192.png",
  "/dist/assets/icons/icon_256x256.png",
  "/dist/assets/icons/icon_384x384.png",
  "/dist/assets/icons/icon_512x512.png",
  "https://cdn.jsdelivr.net/npm/chart.js@2.8.0"
];

const STATIC_CACHE = "static-cache-v1";
const DATA_CACHE_NAME = "data-cache-v1";

self.addEventListener("install", event => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then(cache => cache.addAll(FILES_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// The activate handler takes care of cleaning up old caches.
self.addEventListener("activate", event => {
  const currentCaches = [STATIC_CACHE, DATA_CACHE_NAME];
  event.waitUntil(
    caches
      .keys()
      .then(cacheNames => {
        // return array of cache names that are old to delete
        return cacheNames.filter(
          cacheName => !currentCaches.includes(cacheName)
        );
      })
      .then(cachesToDelete => {
        return Promise.all(
          cachesToDelete.map(cacheToDelete => {
            return caches.delete(cacheToDelete);
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  // non GET requests are not cached and requests to other origins are not cached
  if (
    event.request.method !== "GET" ||
    !event.request.url.startsWith(self.location.origin)
  ) {
    event.respondWith(fetch(event.request));
    return;
  }

  // handle data cache GET requests for data from /api routes
  if (event.request.url.includes("/api/")) {
    // make network request and fallback to cache if network request fails (offline)
    event.respondWith(
      caches.open(DATA_CACHE_NAME).then(cache => {
        return fetch(event.request)
          .then(response => {
            cache.put(event.request, response.clone());
            return response;
          })
          .catch(() => caches.match(event.request));
      })
    );
    return;
  }

  // request is not in cache. make network request and cache the response
  return caches.open(DATA_CACHE_NAME).then(cache => {
    return fetch(event.request).then(response => {
      return cache.put(event.request, response.clone()).then(() => {
        return response;
      });
    });
  });
})