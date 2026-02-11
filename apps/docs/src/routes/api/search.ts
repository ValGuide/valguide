import { createFileRoute } from '@tanstack/react-router'
import { getCookie } from '@tanstack/react-start/server'
import { createFromSource } from 'fumadocs-core/search/server'
import { source } from '@/lib/source'

const COOKIE_NAME = 'docs_auth'

const server = createFromSource(source, {
  language: 'english',
})

export const Route = createFileRoute('/api/search')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const token = getCookie(COOKIE_NAME)
        if (token !== process.env.DOCS_PASSWORD) {
          return new Response('Unauthorized', { status: 401 })
        }
        return server.GET(request)
      },
    },
  },
})
