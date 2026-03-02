import { createFileRoute } from '@tanstack/react-router'
import { adminAuth } from '@/server/admin-auth.server'

export const Route = createFileRoute('/api/auth/$')({
  server: {
    handlers: {
      GET: async ({ request }) => adminAuth.handler(request),
      POST: async ({ request }) => adminAuth.handler(request),
    },
  },
})
