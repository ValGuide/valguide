import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireAuthMiddleware } from '../auth/middleware'
import { completeMultipartUpload } from './upload.server'

const completeUploadSchema = z.object({
  key: z.string(),
  uploadId: z.string(),
  parts: z.array(
    z.object({
      etag: z.string(),
      partNumber: z.number(),
    }),
  ),
})

export const completeUploadFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(completeUploadSchema)
  .handler(async ({ data }) => {
    await completeMultipartUpload(data.key, data.uploadId, data.parts)
    return { success: true }
  })
