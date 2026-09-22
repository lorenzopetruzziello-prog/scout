/* Scout attacco: funziona anche senza rete. */
const CACHE = 'scout-v1';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
const fromCacheThenNet = async (req, key) => {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(key || req, { ignoreSearch: true });
  const net = fetch(req).then(res => { if (res && (res.ok || res.type === 'opaque')) cache.put(key || req, res.clone()); return res; }).catch(() => null);
  if (hit) return hit;                       // apre subito anche senza segnale; l'aggiornamento arriva alla prossima apertura
  return (await net) || new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (req.mode === 'navigate') { e.respondWith(fromCacheThenNet(req, './index.html')); return; }
  if (url.origin === self.location.origin || url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(fromCacheThenNet(req));
  }
});
