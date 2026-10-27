/* Nanthu service worker: caches the app shell and video clips for offline use.
   AI requests (other origins) are never cached or touched. */
const VERSION = 'nanthu-v2';
const SHELL = ['./', 'index.html', 'style.css', 'app.js', 'manifest.json',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png', 'icons/favicon-32.png', 'videos/poster.jpg'];
const VIDEOS = ['idle', 'talk', 'wave', 'laugh', 'dance', 'clap', 'think', 'sad', 'surprised', 'namaste'].map(n => `videos/${n}.mp4`);

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(VERSION);
    await c.addAll(SHELL);
    // videos: best effort, one by one, so a single failure doesn't break install
    await Promise.all(VIDEOS.map(u => fetch(u).then(r => r.ok ? c.put(u, r) : null).catch(() => null)));
    self.skipWaiting();
  })());
});
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for(const k of await caches.keys()) if(k !== VERSION) await caches.delete(k);
    await self.clients.claim();
  })());
});

// Serve byte ranges from a cached full response (Safari/iOS requests video with Range headers)
async function rangeResponse(req, resp){
  const buf = await resp.arrayBuffer(), size = buf.byteLength;
  const m = /bytes=(\d*)-(\d*)/.exec(req.headers.get('range') || '');
  let start = m && m[1] ? +m[1] : 0, end = m && m[2] ? +m[2] : size - 1;
  if(m && !m[1] && m[2]){ start = size - +m[2]; end = size - 1; }
  end = Math.min(end, size - 1);
  if(start >= size || start > end) return new Response(null, {status: 416, headers: {'Content-Range': `bytes */${size}`}});
  return new Response(buf.slice(start, end + 1), {status: 206, statusText: 'Partial Content', headers: {
    'Content-Type': resp.headers.get('Content-Type') || 'video/mp4', 'Content-Range': `bytes ${start}-${end}/${size}`,
    'Content-Length': String(end - start + 1), 'Accept-Ranges': 'bytes'}});
}

self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if(req.method !== 'GET' || url.origin !== self.location.origin) return;   // AI APIs etc: straight to network
  const isVideo = /\.mp4$/.test(url.pathname);
  e.respondWith((async () => {
    const c = await caches.open(VERSION);
    const key = isVideo ? url.pathname.replace(/^.*\/videos\//, 'videos/') : req;
    let hit = await c.match(key, {ignoreSearch: true});
    if(isVideo){
      if(!hit){
        try{ const full = await fetch(url.href); if(full.ok){ await c.put(key, full.clone()); hit = full; } else return full; }
        catch(err){ return new Response('', {status: 504}); }
      }
      return req.headers.has('range') ? rangeResponse(req, hit) : hit;
    }
    if(req.mode === 'navigate'){
      // network first for the page so updates arrive, cache when offline
      try{ const r = await fetch(req); if(r.ok) c.put('index.html', r.clone()); return r; }
      catch(err){ return (await c.match('index.html')) || (await c.match('./')) || Response.error(); }
    }
    if(hit){ fetch(req).then(r => { if(r.ok) c.put(req, r); }).catch(() => {}); return hit; }  // stale-while-revalidate
    try{ const r = await fetch(req); if(r.ok) c.put(req, r.clone()); return r; }
    catch(err){ return Response.error(); }
  })());
});
