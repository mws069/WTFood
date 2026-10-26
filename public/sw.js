// WTFood service worker: makes the app installable on iOS and Android and
// keeps "Ask staff" usable without a connection (milestone 6c):
// - the Ask-staff page is saved whenever it is opened online; offline, every
//   page opens it instead (ready-made phrases and the allergy card work, the
//   translator needs a connection)
// - the app's static files (scripts, styles, fonts) are kept once loaded
// No push notifications. The saved page is removed on logout.

const PAGES = "wtfood-pages-v1";
const STATIC = "wtfood-static-v1";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) =>
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== PAGES && k !== STATIC).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  ),
);

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Static files have a hash in their name and never change: cache first.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(STATIC).then((cache) => cache.put(request, copy));
            }
            return response;
          }),
      ),
    );
    return;
  }

  if (request.mode !== "navigate") return;
  // Pages: always the network; the Ask-staff page is saved for offline use.
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (url.pathname === "/ask" && response.ok && !response.redirected) {
          const copy = response.clone();
          caches.open(PAGES).then((cache) => cache.put("/ask", copy));
        }
        return response;
      })
      .catch(() => caches.match("/ask").then((hit) => hit || Response.error())),
  );
});
