// RustAdmin WebRCON Service Worker - Offline PWA
const CACHE_NAME = 'rustadmin-v1';

// Base scope helper (handles both root '/' and subpath '/rustadmin/' on GitHub Pages)
const getBase = () => {
  try {
    return new URL(self.registration.scope).pathname;
  } catch (e) {
    return './';
  }
};

// Install event: Pre-cache essential application shell and heavy assets
self.addEventListener('install', (event) => {
  const base = getBase();
  const preCacheUrls = [
    base,
    `${base}index.html`,
    `${base}manifest.json`,
    `${base}favicon.svg`,
    `${base}items-spritesheet.webp`,
    `${base}icons/icon-192.png`,
    `${base}icons/icon-512.png`,
    `${base}icons/icon-512-maskable.png`
  ];

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Pre-cache with resilient fetching (don't fail entire install if one optional asset fails)
      return Promise.allSettled(
        preCacheUrls.map((url) =>
          fetch(url, { cache: 'no-cache' })
            .then((res) => {
              if (res.ok) return cache.put(url, res);
            })
            .catch((err) => console.warn('[SW] Pre-cache skip:', url, err))
        )
      );
    }).then(() => self.skipWaiting())
  );
});

// Activate event: Clean up old caches and take control immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('[SW] Removing old cache:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event: Network-first for HTML navigation, Cache-first for static assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET, WebSocket (RCON), or browser extensions
  if (request.method !== 'GET' || url.protocol.startsWith('ws') || url.protocol.startsWith('chrome-extension')) {
    return;
  }

  // Navigation requests (HTML documents): Network first -> Cache fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          // If offline, return cached index.html
          const base = getBase();
          const cached = await caches.match(`${base}index.html`) || await caches.match(base) || await caches.match('./index.html');
          return cached || new Response('RustAdmin is currently offline.', {
            headers: { 'Content-Type': 'text/html' }
          });
        })
    );
    return;
  }

  // Static Assets (JS, CSS, WebP, SVG, PNG, Fonts): Cache first -> Network fallback
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached asset immediately
        return cachedResponse;
      }

      // Not in cache, fetch from network and store for offline use
      return fetch(request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'opaque') {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });

        return networkResponse;
      }).catch((err) => {
        // If offline and requesting an image, return empty SVG or graceful fallback
        if (request.headers.get('accept')?.includes('image/')) {
          return new Response('', { status: 408, statusText: 'Offline Asset Unavailable' });
        }
        throw err;
      });
    })
  );
});
