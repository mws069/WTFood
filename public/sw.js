// WTFood service worker: makes the app installable on iOS and Android.
// Kept minimal on purpose: no offline caching, no push notifications.

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

// A fetch handler is required for installability; requests go straight to the network.
self.addEventListener("fetch", () => {});
