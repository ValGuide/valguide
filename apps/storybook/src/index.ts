import { env } from 'cloudflare:workers'

export default {
  async fetch(request: Request): Promise<Response> {
    const auth = request.headers.get('Authorization')
    if (auth) {
      const [scheme, encoded] = auth.split(' ')
      if (scheme === 'Basic' && encoded) {
        const decoded = atob(encoded)
        const [, password] = decoded.split(':')
        if (password === env.STORYBOOK_PASSWORD) {
          return env.ASSETS.fetch(request)
        }
      }
    }
    return new Response('Unauthorized', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="ValGuide Storybook"' },
    })
  },
}
