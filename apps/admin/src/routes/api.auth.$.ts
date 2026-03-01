import { createFileRoute } from '@tanstack/react-router'
import { adminAuth } from '@valguide/core/features/auth/better-auth.server'

export const Route = createFileRoute('/api/auth/$')({
  server: {
    handlers: {
      GET: async ({ request }) => adminAuth.handler(request),
      POST: async ({ request }) => adminAuth.handler(request),
    },
  },
})
