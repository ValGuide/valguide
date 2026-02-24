import { createFileRoute } from '@tanstack/react-router'
import { robotsResponse } from '@valguide/core/features/seo/robots'

export const Route = createFileRoute('/robots.txt')({
  server: {
    handlers: {
      GET: async () => robotsResponse(process.env.BLOCK_ROBOTS === 'true'),
    },
  },
})
