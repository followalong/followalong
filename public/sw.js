var cacheName = 'pages-cache-v2'

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(cacheName).then(function (cache) {
      return cache.addAll(
        [
          '/',
          '/chunk-vendors.js',
          '/app.js',
          '/app.css',
          '/js/aws-sdk-2.444.0.min.js',
          '/img/favicon-white.svg',
          '/img/favicon.svg',
          '/img/logo-white.svg',
          '/img/logo.svg'
        ]
      )
    })
  )
})

self.addEventListener('fetch', event => {
  // Let the browser do its default thing
  // for non-GET requests.
  if (event.request.method != 'GET') return

  // Prevent the default, and handle the request ourselves.
  event.respondWith(async function () {
    // Try to get the response from a cache.
    const cache = await caches.open(cacheName)
    const cachedResponse = await cache.match(event.request)

    if (cachedResponse) {
      // If we found a match in the cache, return it, but also
      // update the entry in the cache in the background.
      event.waitUntil(cache.add(event.request))
      return cachedResponse
    }

    // If we didn't find a match in the cache, use the network.
    return fetch(event.request)
  }())
})

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          return caches.delete(cacheName)
        })
      )
    })
  )
})
