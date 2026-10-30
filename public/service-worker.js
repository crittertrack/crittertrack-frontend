// Service Worker for CritterTrack PWA
const CACHE_PREFIX = 'crittertrack-';
const CACHE_NAME = 'crittertrack-v35';
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
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Opened new cache:', CACHE_NAME);
      const freshRequests = urlsToCache.map((url) => new Request(url, { cache: 'reload' }));
      return cache.addAll(freshRequests).catch(err => {
        console.warn('[SW] Initial cache failed (ok for offline):', err);
      });
    }).catch(err => console.error('[SW] Cache setup failed:', err))
  );
  self.skipWaiting();
});

const isLocalhost = (url) => url.includes('localhost') || url.includes('127.0.0.1');

const fetchNetworkFirst = async (request) => {
  try {
    // Don't let the browser HTTP cache return a stale app shell or unhashed asset.
    const response = await fetch(new Request(request, { cache: 'no-cache' }));
    if (response && response.status === 200 && response.type !== 'error') {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone()).catch(err => console.error('[SW] Cache put failed:', err));
    }
    return response;
  } catch (error) {
    console.warn('[SW] Network-first fetch failed, serving fallback:', request.url, error);
    const cached = await caches.match(request, { ignoreVary: true });
    if (cached) return cached;
    const fallback = await caches.match('/index.html');
    return fallback || new Response('Offline - Please check your connection', {
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

const shouldUseNetworkFirst = (request, url) => {
  if (request.destination === 'document' || request.headers.get('accept')?.includes('text/html') || url.pathname === '/' || url.pathname.endsWith('.html')) {
    return true;
  }
  // CRA's /static/ build output is content-hashed and immutable per deploy — serve it
  // cache-first so repeat visits/lazy route loads (especially on slower mobile networks)
  // don't pay a full network round trip for a file that can never change.
  if (url.pathname.startsWith('/static/')) {
    return false;
  }
  // Non-hashed assets (images, icons, manifests, and other files) can change in place,
  // so prefer fresh network content while retaining a cached copy for offline use.
  return true;
};

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  if (isLocalhost(request.url)) {
    return;
  }

  if (request.method !== 'GET') {
    return;
  }

  if (request.cache === 'only-if-cached' && request.mode !== 'same-origin') {
    return;
  }

  // Not intercepted: let the browser make the real network request directly. A GET /api/
  // failure needs to surface to axios as a genuine network error (no `error.response`) so
  // apiClient's own offline cache/write-queue layer (see src/utils/apiClient.js) can handle
  // it — this used to fake a 503 JSON response here instead, which masked every /api/ network
  // failure from that layer (axios saw `error.response` present and never took the offline
  // path). PUT/PATCH/DELETE requests never reach here at all (returned above, method !== GET).
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // Let the browser fetch the manifest natively. On protected Vercel previews it redirects to
  // vercel.com/sso-api (no CORS headers), which a SW-initiated fetch() can't follow.
  if (url.pathname === '/manifest.json') {
    return;
  }

  if (shouldUseNetworkFirst(request, url)) {
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
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(cacheNames.map((cacheName) => {
        if (cacheName.startsWith(CACHE_PREFIX) && cacheName !== CACHE_NAME) {
          console.log('[SW] Deleting old cache during activation:', cacheName);
          return caches.delete(cacheName);
        }
      }));
    }).then(() => {
      console.log('[SW] Taking control of all clients');
      return self.clients.claim();
    }).then(() => self.clients.matchAll({ type: 'window' }))
      .then((clients) => {
        console.log('[SW] Notifying clients of activation');
        clients.forEach(client => {
          client.postMessage({ 
            type: 'SW_ACTIVATED', 
            cacheName: CACHE_NAME,
            action: 'UPDATE_READY'
          });
        });
      })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] SKIP_WAITING message received');
    self.skipWaiting();
  }
});

// --- Web Push ---
self.addEventListener('push', (event) => {
  let payload = { title: 'CritterTrack', body: 'You have a new notification.', url: '/notifications' };
  if (event.data) {
    try { payload = { ...payload, ...event.data.json() }; }
    catch (err) { payload.body = event.data.text() || payload.body; }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/logo192.png',
      badge: '/logo192.png',
      tag: payload.tag || undefined,
      data: { url: payload.url || '/' }
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  const url = event.notification.data?.url || '/';
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsArr) => {
      const existing = clientsArr.find((c) => c.url.includes(self.location.origin));
      if (existing) {
        existing.navigate(url);
        return existing.focus();
      }
      return self.clients.openWindow(url);
    })
  );
});
