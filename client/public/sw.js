/* Cache only immutable, content-addressed same-origin files. Never cache HTML,
 * consent-dependent services, API responses, media streams or unhashed files. */
const scope = new URL(self.registration.scope);
const prefix = `seil-static:${scope.pathname}:`;
const name = `${prefix}v1`;
const limit = 120;
function immutable(request) {
  if (request.method !== 'GET' || request.headers.has('Range') || request.cache === 'reload' || request.cache === 'no-store') return false;
  const url = new URL(request.url);
  if (url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname) || url.search) return false;
  const path = url.pathname.slice(scope.pathname.length);
  return /^media\/_responsive\/[a-f0-9]{24}-\d+\.webp$/.test(path) || /^assets\/[^/]+-[A-Za-z0-9_-]{8,}\.(?:js|css|woff2)$/.test(path);
}
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil((async () => {
  for (const key of await caches.keys()) if (key.startsWith(prefix) && key !== name) await caches.delete(key);
  await self.clients.claim();
})()));
self.addEventListener('fetch', event => {
  if (!immutable(event.request)) return;
  event.respondWith((async () => {
    let cache;
    try { cache = await caches.open(name); const hit = await cache.match(event.request); if (hit) return hit; } catch { /* network remains available */ }
    const response = await fetch(event.request);
    if (cache && response.ok && response.type === 'basic' && !/no-store|private/i.test(response.headers.get('Cache-Control') || '')) {
      try {
        await cache.put(event.request, response.clone());
        const keys = await cache.keys();
        for (const key of keys.slice(0, Math.max(0, keys.length - limit))) await cache.delete(key);
      } catch { /* storage quota must not break the page */ }
    }
    return response;
  })());
});
