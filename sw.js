// Cache vỏ app để mở được khi mạng yếu; gọi AI vẫn cần mạng.
const C = 'gia-su-v59';
self.addEventListener('install', e => e.waitUntil(caches.open(C).then(c => c.addAll(['./', 'manifest.json', 'sam-192.png', 'sam-512.png']))));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))))); // bỏ cache phiên bản cũ
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
