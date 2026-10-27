/* Nanthu service worker v3: caches only the small app shell for offline start.
   Videos (.mp4) and AI requests are NOT intercepted: the browser loads video directly with its own
   Range handling (iOS Safari is strict about this), and the HTTP cache keeps them warm. */
const VERSION = 'nanthu-v3';
const SHELL = ['./', 'index.html', 'style.v3.css', 'app.v3.js', 'manifest.json',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png', 'icons/favicon-32.png', 'videos/poster.jpg'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL.map(u => new Request(u, {cache: 'reload'})))));
});
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for(const k of await caches.keys()) if(k !== VERSION) await caches.delete(k);   // drops nanthu-v1/v2 (old video cache)
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if(req.method !== 'GET' || url.origin !== self.location.origin) return;   // AI APIs etc: straight to network
  if(/\.(mp4|webm|m4v)$/i.test(url.pathname) || req.headers.has('range')) return;   // media: let the browser handle it
  e.respondWith((async () => {
    const c = await caches.open(VERSION);
    if(req.mode === 'navigate'){
      // network first for the page so updates arrive, cache when offline
      try{ const r = await fetch(req, {cache: 'no-cache'}); if(r.ok) c.put('index.html', r.clone()); return r; }
      catch(err){ return (await c.match('index.html')) || (await c.match('./')) || Response.error(); }
    }
    const hit = await c.match(req, {ignoreSearch: true});
    if(hit){ fetch(req).then(r => { if(r.ok) c.put(req, r); }).catch(() => {}); return hit; }  // stale-while-revalidate
    try{ const r = await fetch(req); if(r.ok) c.put(req, r.clone()); return r; }
    catch(err){ return Response.error(); }
  })());
});
