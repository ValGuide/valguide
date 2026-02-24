/// <reference lib="webworker" />

// ValGuide Tour App Service Worker
//
// Cache strategies:
//   Navigation (_shell.html)    → network-first, cache fallback
//   /assets/* (JS/CSS)          → cache-first (hashed filenames, immutable)
//   /_serverFn/* (tour data)    → network-first, cache fallback
//   assets.valguide.{dev,com} (R2) → cache-first (immutable media URLs)
//   *.imagekit.io (images)      → cache-first (immutable image URLs)
//
// One tour cached at a time — opening a new tour evicts the previous tour's
// data and media caches, then prefetches all audio for the new tour.

const CACHE_VERSION = 1
const SHELL_CACHE = `vg-shell-v${CACHE_VERSION}`
const STATIC_CACHE = `vg-static-v${CACHE_VERSION}`
const DATA_CACHE = `vg-data-v${CACHE_VERSION}`
const MEDIA_CACHE = `vg-media-v${CACHE_VERSION}`
const META_CACHE = 'vg-meta'
const ALL_CACHES = [SHELL_CACHE, STATIC_CACHE, DATA_CACHE, MEDIA_CACHE, META_CACHE]

// ── Lifecycle ───────────────────────────────────────────────

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(SHELL_CACHE).then((cache) => cache.add('/_shell.html')))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => !ALL_CACHES.includes(key)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

// ── Fetch ───────────────────────────────────────────────────

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Navigation → network-first, return cached shell on failure
  if (request.mode === 'navigate') {
    event.respondWith(shellNetworkFirst(request))
    return
  }

  // Static assets (hashed filenames) → cache-first
  if (url.origin === self.location.origin && url.pathname.startsWith('/assets/')) {
    event.respondWith(cacheFirst(request, STATIC_CACHE))
    return
  }

  // Server functions (tour data) → network-first
  if (url.origin === self.location.origin && url.pathname.startsWith('/_serverFn/')) {
    event.respondWith(networkFirst(request, DATA_CACHE))
    return
  }

  // R2 media (audio, video, images) → cache-first with range support
  if (url.hostname === 'assets.valguide.dev' || url.hostname === 'assets.valguide.com') {
    event.respondWith(mediaCacheFirst(request))
    return
  }

  // ImageKit images → cache-first
  if (url.hostname.endsWith('.imagekit.io')) {
    event.respondWith(mediaCacheFirst(request))
    return
  }
})

// ── Messages ────────────────────────────────────────────────

self.addEventListener('message', (event) => {
  if (event.data?.type === 'TOUR_OPENED') {
    event.waitUntil(handleTourOpened(event.data))
  }
})

// ── Cache Strategies ────────────────────────────────────────

async function shellNetworkFirst(request) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(SHELL_CACHE)
      await cache.put('/_shell.html', response.clone())
    }
    return response
  } catch {
    const cached = await caches.match('/_shell.html')
    if (cached) return cached
    return offlineResponse()
  }
}

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request)
  if (cached) return cached

  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(cacheName)
      await cache.put(request, response.clone())
    }
    return response
  } catch {
    return offlineResponse()
  }
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(cacheName)
      await cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await caches.match(request)
    if (cached) return cached
    return offlineResponse()
  }
}

async function mediaCacheFirst(request) {
  const url = request.url
  const cached = await caches.match(url)

  if (cached) {
    if (request.headers.has('range')) {
      return createRangeResponse(request, cached)
    }
    return cached
  }

  try {
    const response = await fetch(request)
    if (response.ok || response.type === 'opaque') {
      const cache = await caches.open(MEDIA_CACHE)
      await cache.put(url, response.clone())
    }
    return response
  } catch {
    return offlineResponse()
  }
}

function offlineResponse() {
  return new Response('Offline', { status: 503, statusText: 'Service Unavailable' })
}

// ── Range Request Support (iOS Safari) ──────────────────────

async function createRangeResponse(request, cachedResponse) {
  const rangeHeader = request.headers.get('range')
  if (!rangeHeader) return cachedResponse

  const match = /^bytes=(\d+)-(\d*)$/.exec(rangeHeader)
  if (!match) return cachedResponse

  const data = await cachedResponse.arrayBuffer()
  const size = data.byteLength
  const start = Number(match[1])

  if (start >= size) {
    return new Response(null, {
      status: 416,
      statusText: 'Range Not Satisfiable',
      headers: { 'Content-Range': `bytes */${size}` },
    })
  }

  const end = match[2] ? Math.min(Number(match[2]), size - 1) : size - 1
  const sliced = data.slice(start, end + 1)

  return new Response(sliced, {
    status: 206,
    statusText: 'Partial Content',
    headers: {
      'Content-Type': cachedResponse.headers.get('Content-Type') || 'application/octet-stream',
      'Content-Range': `bytes ${start}-${end}/${size}`,
      'Content-Length': String(sliced.byteLength),
      'Accept-Ranges': 'bytes',
    },
  })
}

// ── Tour Prefetch & Eviction ────────────────────────────────

async function getCurrentTourKey() {
  const cache = await caches.open(META_CACHE)
  const response = await cache.match('/meta/current-tour')
  return response ? response.text() : null
}

async function setCurrentTourKey(tourKey) {
  const cache = await caches.open(META_CACHE)
  await cache.put('/meta/current-tour', new Response(tourKey))
}

async function handleTourOpened({ audioUrls, tourKey }) {
  const previousKey = await getCurrentTourKey()

  // Same tour — just ensure audio is cached (no eviction)
  if (previousKey === tourKey) {
    await prefetchUrls(audioUrls)
    await notifyClients({ type: 'TOUR_READY_OFFLINE', tourKey })
    return
  }

  // Different tour — evict old data and media, then prefetch
  await Promise.all([caches.delete(DATA_CACHE), caches.delete(MEDIA_CACHE)])
  await setCurrentTourKey(tourKey)
  await prefetchUrls(audioUrls)
  await notifyClients({ type: 'TOUR_READY_OFFLINE', tourKey })
}

async function prefetchUrls(urls) {
  if (!urls?.length) return

  const cache = await caches.open(MEDIA_CACHE)
  await Promise.allSettled(
    urls.map(async (url) => {
      if (await cache.match(url)) return
      try {
        const response = await fetch(url)
        if (response.ok) await cache.put(url, response)
      } catch {
        // Audio will be fetched on demand when the user navigates to the stop
      }
    }),
  )
}

async function notifyClients(message) {
  const clients = await self.clients.matchAll()
  for (const client of clients) {
    client.postMessage(message)
  }
}
