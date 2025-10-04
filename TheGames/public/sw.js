/* Service worker for TheGames (public copy)
   Placed in TheGames/public so Vite will copy it to dist/ at build time.
*/

const CACHE_NAME = 'thegames-static-v1';
const baseUrl = new URL('.', self.location.href).href; // e.g. https://.../TheGames/

async function cacheIndexAndAssets(cache) {
  try {
    const indexUrl = new URL('index.html', baseUrl).href;
    const resp = await fetch(indexUrl, { cache: 'no-store' });
    if (!resp.ok) throw new Error('Failed to fetch index.html');
    const html = await resp.text();

    const urls = new Set();
    urls.add(indexUrl);
    urls.add(new URL('sw.js', baseUrl).href);

    const re = /(?:src|href)="([^"#?]+)(?:\?[^\"]*)?"/g;
    let m;
    while ((m = re.exec(html))) {
      let u = m[1];
      if (/^https?:\/\//.test(u)) continue;
      const abs = new URL(u, baseUrl).href;
      urls.add(abs);
    }

    const list = Array.from(urls);
    await cache.addAll(list);
    return true;
  } catch (err) {
    console.warn('SW install: failed to cache index/assets', err);
    return false;
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cacheIndexAndAssets(cache);
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => (k === CACHE_NAME ? Promise.resolve() : caches.delete(k))));
    self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(req);
    if (cached) return cached;
    try {
      const res = await fetch(req);
      try { await cache.put(req, res.clone()); } catch (e) { /* ignore opaque responses */ }
      return res;
    } catch (err) {
      const index = await cache.match(new URL('index.html', baseUrl).href);
      return index || Response.error();
    }
  })());
});

