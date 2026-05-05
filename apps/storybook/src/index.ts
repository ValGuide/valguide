import { env } from 'cloudflare:workers'
import { robotsResponse } from '@valguide/core/features/seo/robots'

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)

    if (url.pathname === '/robots.txt') {
      return robotsResponse(env.BLOCK_ROBOTS === 'true')
    }

    if (env.DEV_PROXY) {
      const proxied = new URL(request.url)
      proxied.host = env.DEV_PROXY
      proxied.protocol = 'http:'
      return fetch(proxied.toString(), request)
    }

    if (!env.ASSETS) {
      return new Response('Static assets binding is not configured.', { status: 500 })
    }

    return env.ASSETS.fetch(request)
  },
}
