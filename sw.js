const CACHE_NAME = 'csilan-crm-v1';
const STATIC_ASSETS = [
  '/csilan-crm/',
  '/csilan-crm/index.html',
  '/csilan-crm/logo-192.svg',
  '/csilan-crm/logo-512.svg',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js',
  'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css'
];

// Install: cache static assets
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(STATIC_ASSETS).catch(function() {
        // Ignore failed cache items (CDN may block)
      });
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

// Fetch: network first, fallback to cache
self.addEventListener('fetch', function(e) {
  // Skip Supabase API calls — always network
  if (e.request.url.includes('supabase.co')) return;

  e.respondWith(
    fetch(e.request).then(function(res) {
      // Cache successful GET responses
      if (e.request.method === 'GET' && res.status === 200) {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(e.request, clone);
        });
      }
      return res;
    }).catch(function() {
      return caches.match(e.request);
    })
  );
});
