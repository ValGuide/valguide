import { createFileRoute } from '@tanstack/react-router'
import { getAuthSession } from '@valguide/core/features/auth/better-auth.server'
import { uploadPart } from '@valguide/core/platform/storage/object-storage.server'

export const Route = createFileRoute('/api/upload-part')({
  server: {
    handlers: {
      PUT: async ({ request }) => {
        const session = await getAuthSession()
        if (!session?.user?.id) {
          return new Response('Unauthorized', { status: 401 })
        }

        const url = new URL(request.url)
        const key = url.searchParams.get('key')
        const uploadId = url.searchParams.get('uploadId')
        const partNumberStr = url.searchParams.get('partNumber')

        if (!key || !uploadId || !partNumberStr) {
          return new Response('Missing required parameters (key, uploadId, partNumber)', { status: 400 })
        }

        const partNumber = Number.parseInt(partNumberStr, 10)
        if (Number.isNaN(partNumber) || partNumber < 1) {
          return new Response('Invalid partNumber', { status: 400 })
        }

        if (!request.body) {
          return new Response('Missing request body', { status: 400 })
        }

        const result = await uploadPart(key, uploadId, partNumber, request.body)

        return Response.json({ etag: result.etag, partNumber: result.partNumber })
      },
    },
  },
})
