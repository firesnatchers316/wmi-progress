/* SuperWho service worker for progress.superwho.io
   - push: shows the notification; click opens or focuses the page
   - offline: small shell cache; HTML is network-first; heard-status.json is NEVER cached */
const CACHE = 'superwho-shell-v1';
const SHELL = ['/', '/manifest.webmanifest', '/icons/icon-192.png', '/icons/apple-touch-icon.png', '/zach/logo-icon.svg'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).catch(() => {}).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;            // Apps Script, fonts etc: browser default
  if (url.pathname.endsWith('/heard-status.json')) {           // live data: network only, never cached
    event.respondWith(fetch(req, { cache: 'no-store' }));
    return;
  }
  if (req.mode === 'navigate' || url.pathname === '/' || url.pathname.endsWith('.html')) {
    event.respondWith(fetch(req).then(res => {                 // network first, keep a copy for offline
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put('/', copy)); }
      return res;
    }).catch(() => caches.match('/').then(r => r || Response.error())));
    return;
  }
  if (url.pathname.startsWith('/icons/') || url.pathname.startsWith('/zach/')) {
    event.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    })));
  }
});

self.addEventListener('push', event => {
  let d = {};
  try { d = event.data ? event.data.json() : {}; } catch (e) { d = { body: event.data ? event.data.text() : '' }; }
  const title = d.title || 'SuperWho';
  const opts = {
    body: d.body || 'There is an update on your WMI site.',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: d.tag || 'superwho-update',
    renotify: true,
    data: { url: d.url || '/?src=push#update' }
  };
  event.waitUntil(self.registration.showNotification(title, opts));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const target = new URL((event.notification.data && event.notification.data.url) || '/', self.location.origin).href;
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    for (const c of list) {
      if (new URL(c.url).origin === self.location.origin) {
        return ('navigate' in c ? c.navigate(target).catch(() => c) : Promise.resolve(c)).then(w => (w || c).focus());
      }
    }
    return self.clients.openWindow(target);
  }));
});
