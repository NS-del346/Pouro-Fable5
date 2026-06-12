/* =============================================================================
   Pourō — sw.js  (PR-006B)
   Cache strategy
     App shell  → cache-first  (pre-cached at install time)
     Google Fonts → stale-while-revalidate (runtime)
     Everything else → network-only (no interference)
   ============================================================================= */

const CACHE_VERSION = 'v1';
const APP_CACHE  = `pouro-app-${CACHE_VERSION}`;
const FONT_CACHE = `pouro-fonts-${CACHE_VERSION}`;

const APP_SHELL = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.webmanifest',
  './assets/app-icon.png',
  './assets/pwa-512.png',
  './assets/wordmark-ink.png',
  './assets/method-46.png',
  './assets/method-hybrid.png',
  './assets/method-10-pour.png',
  './assets/method-ice-brew.png',
  './assets/icons/icon-back.png',
  './assets/icons/icon-bean.png',
  './assets/icons/icon-dripper.png',
  './assets/icons/icon-drop.png',
  './assets/icons/icon-export.png',
  './assets/icons/icon-history.png',
  './assets/icons/icon-next.png',
  './assets/icons/icon-note.png',
  './assets/icons/icon-pause.png',
  './assets/icons/icon-play.png',
  './assets/icons/icon-scale.png',
  './assets/icons/icon-settings.png',
  './assets/icons/icon-thermometer.png',
  './assets/icons/icon-timer.png',
  './assets/icons/icon-volume.png',
  './assets/icons/icon-wake-lock.png',
];

/* ── Install: pre-cache app shell ───────────────────────────────────────────── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(APP_CACHE)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
      .catch(err => {
        console.warn('[Pouro] Service worker install failed:', err);
        throw err;
      })
  );
});

/* ── Activate: evict stale caches ───────────────────────────────────────────── */
self.addEventListener('activate', event => {
  const keep = new Set([APP_CACHE, FONT_CACHE]);
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => !keep.has(k)).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* ── Fetch ──────────────────────────────────────────────────────────────────── */
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(staleWhileRevalidate(FONT_CACHE, req));
    return;
  }

  if (url.origin === location.origin) {
    event.respondWith(cacheFirst(APP_CACHE, req));
    return;
  }
});

/* ── Strategies ─────────────────────────────────────────────────────────────── */
async function cacheFirst(cacheName, req) {
  const cached = await caches.match(req);
  if (cached) return cached;
  try {
    const res = await fetch(req);
    if (res.ok) {
      const cache = await caches.open(cacheName);
      cache.put(req, res.clone());
    }
    return res;
  } catch {
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

async function staleWhileRevalidate(cacheName, req) {
  const cache  = await caches.open(cacheName);
  const cached = await cache.match(req);
  const revalidate = fetch(req).then(res => {
    if (res.ok) cache.put(req, res.clone());
    return res;
  }).catch(() => null);
  return cached ?? await revalidate ?? new Response('', { status: 503 });
}
