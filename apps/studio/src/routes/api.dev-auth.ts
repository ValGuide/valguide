import { createFileRoute } from '@tanstack/react-router'
import { generateDevMagicLink } from '@valguide/features/auth/dev-auth.server'

export const Route = createFileRoute('/api/dev-auth')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const result = await generateDevMagicLink()
          return Response.json(result)
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error'
          return Response.json({ error: message }, { status: 400 })
        }
      },
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as { email?: string }
          const result = await generateDevMagicLink(body.email)
          return Response.json(result)
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error'
          return Response.json({ error: message }, { status: 400 })
        }
      },
    },
  },
})
