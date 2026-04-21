import { createFileRoute } from '@tanstack/react-router'
import { createLocalAssetResponse } from '@valguide/core/platform/storage/local-asset-response.server'

export const Route = createFileRoute('/api/assets/$' as any)({
  server: {
    handlers: {
      GET: async ({ request }) => createLocalAssetResponse(request),
    },
  },
})
