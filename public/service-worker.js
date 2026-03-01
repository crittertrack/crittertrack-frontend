// Service Worker for CritterTrack PWA
const CACHE_NAME = 'crittertrack-v9'; // Increment version to force cache update
const urlsToCache = [
  '/',
  '/index.html',
  '/logo.png'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('[SW] Installing new service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Opened cache');
        // Don't cache all URLs upfront - let them be cached on demand
        return cache.addAll(urlsToCache).catch(err => {
          console.log('[SW] Initial cache failed (ok for offline):', err);
        });
      })
      .catch(err => console.error('[SW] Cache open failed:', err))
  );
  self.skipWaiting(); // Force immediate activation of new SW
});

// Fetch event - Network-first for HTML, cache-first for assets
self.addEventListener('fetch', (event) => {
  // Skip service worker for localhost development
  if (event.request.url.includes('localhost') || event.request.url.includes('127.0.0.1')) {
    return;
  }
  
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests (POST, PUT, DELETE, etc.) - they can't be cached
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip API requests - always go to network
  if (url.pathname.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          console.log('[SW] API request success:', url.pathname);
          return response;
        })
        .catch(err => {
          console.error('[SW] API request failed:', url.pathname, err);
          return new Response(JSON.stringify({ error: 'Network error' }), {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({ 'Content-Type': 'application/json' })
          });
        })
    );
    return;
  }
  
  // Network-first strategy for HTML files (ensures updates are fetched)
  if (request.headers.get('accept')?.includes('text/html') || url.pathname === '/' || url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          console.log('[SW] HTML network fetch:', url.pathname);
          if (!response || response.status !== 200) {
            return response;
          }
          // Clone and cache the response
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
          return response;
        })
        .catch((err) => {
          console.log('[SW] HTML fetch failed, trying cache:', url.pathname, err);
          // If network fails, try cache
          return caches.match(request)
            .then(response => response || new Response('Offline - page not cached', { status: 503 }));
        })
    );
    return;
  }
  
  // Cache-first strategy for other resources (CSS, JS, images)
  event.respondWith(
    caches.match(request, { ignoreVary: true })
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        // Cache miss - fetch and cache
        return fetch(request).then(
          (response) => {
            // Check if valid response
            if (!response || response.status !== 200 || response.type === 'error') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                // Cache using ignoreSearch to normalize URLs with query params
                cache.put(request, responseToCache);
              })
              .catch(err => console.error('[SW] Cache put failed:', err));

            return response;
          }
        ).catch(err => {
          console.error('[SW] Fetch failed:', url.pathname, err);
          return new Response('Network error', { status: 503 });
        });
      })
      .catch(err => {
        console.error('[SW] Cache match failed:', err);
        return fetch(request);
      })
  );
});

// Activate event - cleanup old caches and claim clients immediately
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating new service worker version:', CACHE_NAME);
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all clients immediately - this forces page reload
      console.log('[SW] Taking control of all clients');
      return self.clients.claim();
    })
  );
});

// Listen for messages from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] SKIP_WAITING message received');
    self.skipWaiting();
  }
});
