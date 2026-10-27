/* Офлайн-режим для GitHub Pages: після першого відкриття гра працює без інтернету.
   Після оновлення файлів на сайті — змініть VERSION, щоб телефони підтягнули нову версію. */
var VERSION = 'ostriv-2026-10-26-1';
var FILES = [
  './', 'index.html', 'manifest.webmanifest', 'css/style.css',
  'js/config.js', 'js/content.js', 'js/art.js', 'js/state.js', 'js/ui.js', 'js/screens.js', 'js/tools.js', 'js/main.js',
  'assets/icon-180.png', 'assets/icon-192.png', 'assets/icon-512.png',
  'assets/fonts/caveat-cyrillic-700-normal.woff2',
  'assets/fonts/caveat-latin-700-normal.woff2',
  'assets/fonts/golos-text-cyrillic-500-normal.woff2',
  'assets/fonts/golos-text-cyrillic-600-normal.woff2',
  'assets/fonts/golos-text-cyrillic-700-normal.woff2',
  'assets/fonts/golos-text-latin-500-normal.woff2',
  'assets/fonts/golos-text-latin-600-normal.woff2',
  'assets/fonts/golos-text-latin-700-normal.woff2',
  'assets/fonts/unbounded-cyrillic-700-normal.woff2',
  'assets/fonts/unbounded-latin-700-normal.woff2'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

/* Спершу з кешу (миттєво й без мережі), паралельно оновлюємо кеш з мережі */
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.open(VERSION).then(function (cache) {
    return cache.match(req, { ignoreSearch: true }).then(function (hit) {
      var net = fetch(req).then(function (res) {
        if (res && res.ok) cache.put(req, res.clone());
        return res;
      }).catch(function () { return hit; });
      return hit || net;
    });
  }));
});
