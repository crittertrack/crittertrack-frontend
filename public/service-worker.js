// Service Worker for CritterTrack PWA
const CACHE_NAME = 'crittertrack-v29'; // Increment version to force cache update
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo.png'
];

// Install event - cache app shell resources
self.addEventListener('install', (event) => {
  console.log('[SW] Installing new service worker...', CACHE_NAME);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Opened cache');
        return cache.addAll(urlsToCache).catch(err => {
          console.warn('[SW] Initial cache failed (ok for offline):', err);
        });
      })
      .catch(err => console.error('[SW] Cache open failed:', err))
  );
  self.skipWaiting();
});

const isLocalhost = (url) => url.includes('localhost') || url.includes('127.0.0.1');

const fetchNetworkFirst = async (request) => {
  try {
    const response = await fetch(request);
    return response;
  } catch (error) {
    console.warn('[SW] Network-first fetch failed, serving fallback:', request.url, error);
    const cached = await caches.match('/index.html');
    return cached || new Response('Offline - Please check your connection', {
      status: 503,
      headers: { 'Content-Type': 'text/html' }
    });
  }
};

const fetchCacheFirst = async (request) => {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request, { ignoreVary: true });
  if (cachedResponse) {
    return cachedResponse;
  }

  const response = await fetch(request);
  if (response && response.status === 200 && response.type !== 'error') {
    cache.put(request, response.clone()).catch(err => console.error('[SW] Cache put failed:', err));
  }
  return response;
};

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (isLocalhost(request.url)) {
    return;
  }

  if (request.method !== 'GET') {
    return;
  }

  if (request.cache === 'only-if-cached' && request.mode !== 'same-origin') {
    return;
  }

  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then(response => response)
        .catch(() => new Response(JSON.stringify({ error: 'Network error' }), {
          status: 503,
          statusText: 'Service Unavailable',
          headers: { 'Content-Type': 'application/json' }
        }))
    );
    return;
  }

  if (request.destination === 'document' || request.headers.get('accept')?.includes('text/html') || url.pathname === '/' || url.pathname.endsWith('.html')) {
    event.respondWith(fetchNetworkFirst(request));
    return;
  }

  event.respondWith(fetchCacheFirst(request).catch(async (err) => {
    console.error('[SW] Cache-first fetch failed:', request.url, err);
    const fallback = await caches.match('/index.html');
    return fallback || new Response('Offline', { status: 503 });
  }));
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating new service worker version:', CACHE_NAME);
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(cacheNames.map((cacheName) => {
        if (!cacheWhitelist.includes(cacheName)) {
          console.log('[SW] Deleting old cache:', cacheName);
          return caches.delete(cacheName);
        }
      }));
    }).then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ type: 'window' }))
      .then((clients) => {
        clients.forEach(client => client.postMessage({ type: 'SW_ACTIVATED', cacheName: CACHE_NAME }));
      })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] SKIP_WAITING message received');
    self.skipWaiting();
  }
});
