/* IAP Học Bài – service worker: cho phép cài đặt và mở khi mất mạng.
   Luôn ưu tiên bản mới trên mạng; chỉ dùng bản lưu khi không có mạng. */
var CACHE = "iap-hoc-bai-v1";
var CORE = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(CORE); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  var u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin || /version\.json$/.test(u.pathname)) return;
  e.respondWith(fetch(e.request).then(function (r) {
    if (r && r.ok) { var cp = r.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, cp); }); }
    return r;
  }).catch(function () {
    return caches.match(e.request).then(function (m) { return m || caches.match("./index.html"); });
  }));
});
