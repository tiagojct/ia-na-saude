/**
 * IA · Saúde service worker.
 *
 * Strategy:
 *   - precache: app shell on install (entry + manifest + icons + og)
 *   - runtime:
 *       same-origin asset (assets/*, *.png, *.svg, *.css, *.js, *.woff2)
 *         → cache-first, fallback network, populate cache on first hit
 *       same-origin HTML
 *         → network-first, fall back to cache, offline-shell fallback
 *       cross-origin (Google Fonts)
 *         → stale-while-revalidate via runtime cache
 *
 *   - bump CACHE_VERSION on every release to invalidate.
 */

const CACHE_VERSION = "iasaude-v5-2026-06-16";
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const ASSET_CACHE = `${CACHE_VERSION}-assets`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

// Replaced at install by the scope URL.
const SCOPE = self.registration?.scope || self.location.href;

const PRECACHE_URLS = [
  "",
  "pt-PT/",
  "manifest.webmanifest",
  "favicon.svg",
  "favicon.ico",
  "apple-touch-icon.png",
  "icon-192.png",
  "icon-512.png",
  "og.png",
].map((path) => new URL(path, SCOPE).toString());

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      await Promise.allSettled(
        PRECACHE_URLS.map((u) =>
          cache.add(new Request(u, { cache: "reload" })).catch(() => null),
        ),
      );
      self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((n) => !n.startsWith(CACHE_VERSION))
          .map((n) => caches.delete(n)),
      );
      await self.clients.claim();
    })(),
  );
});

function isAsset(url) {
  return /\.(?:js|css|woff2?|ttf|otf|png|jpg|jpeg|webp|svg|ico|json)(\?.*)?$/i.test(
    url.pathname,
  );
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;

  if (sameOrigin && isAsset(url)) {
    event.respondWith(cacheFirst(req, ASSET_CACHE));
    return;
  }
  if (sameOrigin && req.mode === "navigate") {
    event.respondWith(networkFirst(req));
    return;
  }
  if (
    !sameOrigin &&
    (url.host === "fonts.googleapis.com" || url.host === "fonts.gstatic.com")
  ) {
    event.respondWith(staleWhileRevalidate(req, RUNTIME_CACHE));
    return;
  }
});

async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req);
  if (hit) return hit;
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch {
    return hit || new Response("", { status: 504, statusText: "offline" });
  }
}

async function networkFirst(req) {
  const cache = await caches.open(SHELL_CACHE);
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch {
    const cached = await cache.match(req);
    if (cached) return cached;
    const shell = await cache.match(new URL("pt-PT/", SCOPE).toString());
    if (shell) return shell;
    return new Response(
      "<!doctype html><meta charset=utf-8><title>offline</title><body style='font-family:system-ui;padding:2rem'><h1>Offline</h1><p>Esta página ainda não está na cache. Volta a abrir o site com ligação para gravar para uso offline.</p>",
      { status: 503, headers: { "content-type": "text/html; charset=utf-8" } },
    );
  }
}

async function staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req);
  const fetching = fetch(req)
    .then((res) => {
      if (res.ok) cache.put(req, res.clone());
      return res;
    })
    .catch(() => hit);
  return hit || fetching;
}

self.addEventListener("message", (event) => {
  if (event.data === "skip-waiting") self.skipWaiting();
});
