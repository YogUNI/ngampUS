// ngampUS Progressive Web App Service Worker
const CACHE_NAME = "ngampus-pwa-v1";
const STATIC_ASSETS = [
  "/",
  "/logo_ngampUS.png",
  "/icon-192.png",
  "/icon-512.png",
  "/manifest.json",
  "/favicon.ico"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Network-first with fallback to cache for navigations, cache-first for static icons
self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Don't intercept API requests, Supabase calls, or admin actions
  if (
    request.method !== "GET" ||
    request.url.includes("/api/") ||
    request.url.includes("/auth/") ||
    request.url.includes("supabase.co")
  ) {
    return;
  }

  // Handle static asset caches
  if (
    request.url.match(/\.(png|jpg|jpeg|svg|gif|ico|woff2)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        return (
          cached ||
          fetch(request).then((response) => {
            if (response && response.status === 200) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return response;
          })
        );
      })
    );
    return;
  }

  // For pages/routes, use network first, fallback to cached page or offline
  event.respondWith(
    fetch(request)
      .then((response) => {
        return response;
      })
      .catch(() => {
        return caches.match(request).then((cached) => {
          return cached || caches.match("/");
        });
      })
  );
});
