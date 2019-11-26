workbox.precaching.precacheAndRoute(self.__precacheManifest);

workbox.routing.registerNavigationRoute(
  workbox.precaching.getCacheKeyForURL('/index.html')
);

workbox.routing.registerRoute(
  /https:\/\/assets\.gauslin\.com\/fonts/,
  new workbox.strategies.NetworkFirst({
    cacheName: 'fonts',
    plugins: [
      new workbox.expiration.Plugin({
        maxAgeSeconds: 60 * 60, // 1 hour
      })
    ]
  })
);
