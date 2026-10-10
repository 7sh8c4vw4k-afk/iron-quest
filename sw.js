const CACHE = 'iron-quest-v11';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './styles.css?v=11',
  './app.js',
  './app.js?v=11',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

function isNavigationOrHtml(request, url) {
  if (request.mode === 'navigate') return true;
  const path = url.pathname;
  return path.endsWith('/') || path.endsWith('/index.html') || path.endsWith('index.html');
}

function isJsOrCss(url) {
  return /\.(js|css)(\?|$)/.test(url.pathname) || /[?&]v=\d+/.test(url.search);
}

function networkFirst(request) {
  return fetch(request)
    .then((res) => {
      if (res && res.status === 200 && (res.type === 'basic' || res.type === 'cors')) {
        const clone = res.clone();
        caches.open(CACHE).then((c) => c.put(request, clone));
      }
      return res;
    })
    .catch(() => caches.match(request).then((cached) => cached || caches.match('./index.html')));
}

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;

  if (isNavigationOrHtml(e.request, url) || isJsOrCss(url)) {
    e.respondWith(networkFirst(e.request));
    return;
  }

  // Other assets: cache-first with network update
  e.respondWith(
    caches.match(e.request).then((cached) => {
      const fetched = fetch(e.request)
        .then((res) => {
          if (res && res.status === 200 && res.type === 'basic') {
            const clone = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, clone));
          }
          return res;
        })
        .catch(() => cached);
      return cached || fetched;
    })
  );
});
