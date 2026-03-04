import { createFileRoute } from '@tanstack/react-router'
import { getAuthSession } from '@valguide/core/features/auth/better-auth.server'
import { putObject } from '@valguide/core/features/storage/upload.server'

export const Route = createFileRoute('/api/upload')({
  server: {
    handlers: {
      PUT: async ({ request }) => {
        const session = await getAuthSession()
        if (!session?.user?.id) {
          return new Response('Unauthorized', { status: 401 })
        }

        const url = new URL(request.url)
        const key = url.searchParams.get('key')
        if (!key) {
          return new Response('Missing key parameter', { status: 400 })
        }

        if (!request.body) {
          return new Response('Missing request body', { status: 400 })
        }

        const contentType = request.headers.get('content-type') ?? 'application/octet-stream'
        await putObject(key, request.body, contentType)

        return Response.json({ success: true })
      },
    },
  },
})
