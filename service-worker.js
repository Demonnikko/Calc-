/* Illusionist OS PWA SW */
const CACHE_VERSION = 'illusionist-os-v1';
const CORE_CACHE = `${CACHE_VERSION}-core`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

// Put your app files here (same folder)
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png'
];

// External CDN assets you use (Tailwind/Lucide/Fonts)
const EXTERNAL_ASSETS = [
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/lucide@latest',
  'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;800&family=Inter:wght@300;400;500;600&display=swap'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CORE_CACHE);
    await cache.addAll(CORE_ASSETS);

    // Pre-cache external (opaque) – best effort
    const runtime = await caches.open(RUNTIME_CACHE);
    await Promise.all(EXTERNAL_ASSETS.map(async (url) => {
      try { await runtime.add(url); } catch (e) {}
    }));

    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => {
      if (!k.startsWith(CACHE_VERSION)) return caches.delete(k);
    }));
    self.clients.claim();
  })());
});

// Cache strategy:
// - same-origin: cache-first
// - cross-origin: stale-while-revalidate (best effort)
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Only GET
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  event.respondWith((async () => {
    // Same-origin: cache first
    if (url.origin === self.location.origin) {
      const cached = await caches.match(req);
      if (cached) return cached;

      try {
        const fresh = await fetch(req);
        const cache = await caches.open(CORE_CACHE);
        cache.put(req, fresh.clone());
        return fresh;
      } catch (e) {
        // Offline fallback: return cached index
        const fallback = await caches.match('./index.html');
        if (fallback) return fallback;
        throw e;
      }
    }

    // Cross-origin: stale-while-revalidate
    const cache = await caches.open(RUNTIME_CACHE);
    const cached = await cache.match(req);

    const fetchPromise = fetch(req).then((fresh) => {
      cache.put(req, fresh.clone());
      return fresh;
    }).catch(() => cached);

    return cached || fetchPromise;
  })());
});
