// TINY KURUMA GO! — funciona sin internet una vez abierto.
// La página siempre se pide primero a la red (para tener la última versión) y, si no hay conexión, se usa la guardada.
// La música no pasa por aquí: el navegador la pide por trozos y en iPhone daría problemas.
const CACHE = 'tkg-v21';
const CORE = ['./', './index.html', './manifest.json', './icon-180.png', './icon-192.png', './icon-512.png', './icon-mask-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.pathname.includes('/music/')) return;
  const page = r.mode === 'navigate' || u.pathname.endsWith('/') || u.pathname.endsWith('/index.html');
  if (page) {
    e.respondWith(fetch(r).then(res => {
      if (res.status === 200) { const cp = res.clone(); caches.open(CACHE).then(c => c.put('./index.html', cp)); }
      return res;
    }).catch(() => caches.match('./index.html')));
    return;
  }
  const fonts = u.host.endsWith('googleapis.com') || u.host.endsWith('gstatic.com');
  if (u.origin !== location.origin && !fonts) return;
  e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => {
    if (res.status === 200 || res.type === 'opaque') { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); }
    return res;
  })));
});
