// Lưu sẵn vỏ app nhỏ (~vài trăm KB); tệp lớn (nhân vật 12 MB, video, cảnh) lưu khi thực sự dùng tới — không bắt điện thoại tải 26 MB mỗi bản mới. Gọi AI vẫn cần mạng.
const C = 'gia-su-v62';
const ASSETS = ['./', 'index.html', 'manifest.json', 'sam-192.png', 'sam-512.png', 'xianxia.mjs', 'mocap.mjs',
  'data/targets.js', 'data/exams.js', 'data/langs.js', 'data/us-civics.js'];
self.addEventListener('install', e => e.waitUntil(caches.open(C).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim()))); // bỏ cache phiên bản cũ
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const u = new URL(e.request.url), local = u.origin === self.location.origin, cdn = u.hostname === 'cdn.jsdelivr.net';
  if (!local && !cdn) return;
  e.respondWith(fetch(e.request).then(r => {
    if (r.ok || r.type === 'opaque') caches.open(C).then(c => c.put(e.request, r.clone())).catch(() => {});
    return r;
  }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(async r => {
    if (r) return r;
    if (local && e.request.mode === 'navigate') return caches.match('./');
    throw new Error('offline cache miss');
  })));
});
