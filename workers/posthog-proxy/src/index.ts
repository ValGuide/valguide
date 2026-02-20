/**
 * PostHog reverse proxy Worker.
 *
 * Proxies analytics requests through our domain to avoid ad blockers.
 * Uses PostHog EU servers (Frankfurt) for GDPR compliance.
 *
 * Deployed at e.valguide.com (prod) / e.valguide.dev (dev).
 */

const POSTHOG_HOST = 'https://eu.i.posthog.com'
const POSTHOG_ASSETS_HOST = 'https://eu-assets.i.posthog.com'

export default {
  async fetch(request: Request, _env: unknown, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)
    const pathname = url.pathname + url.search

    if (pathname.startsWith('/static/')) {
      return retrieveStatic(request, pathname, ctx)
    }

    return forwardRequest(request, pathname)
  },
}

async function retrieveStatic(request: Request, pathname: string, ctx: ExecutionContext): Promise<Response> {
  const cache = caches.default
  let response = await cache.match(request)

  if (!response) {
    response = await fetch(`${POSTHOG_ASSETS_HOST}${pathname}`)
    // Cache static assets for 24 hours
    response = new Response(response.body, response)
    response.headers.set('Cache-Control', 'public, max-age=86400')
    ctx.waitUntil(cache.put(request, response.clone()))
  }

  return response
}

async function forwardRequest(request: Request, pathname: string): Promise<Response> {
  const headers = new Headers(request.headers)

  // Preserve real user IP for accurate geolocation
  headers.set('X-Forwarded-For', request.headers.get('CF-Connecting-IP') ?? '')

  // Remove cookies for privacy
  headers.delete('cookie')

  return fetch(`${POSTHOG_HOST}${pathname}`, {
    method: request.method,
    headers,
    body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.arrayBuffer() : null,
  })
}
