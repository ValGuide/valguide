import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { initMultipartUpload, MULTIPART_THRESHOLD, PART_SIZE } from '../../platform/storage/object-storage.server'
import { requireAuthMiddleware } from '../auth/middleware'

const initUploadSchema = z.object({
  key: z.string(),
  contentType: z.string(),
  fileSize: z.number().int().positive(),
})

export const initUploadFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(initUploadSchema)
  .handler(async ({ data }) => {
    if (data.fileSize < MULTIPART_THRESHOLD) {
      return { mode: 'put' as const, key: data.key }
    }

    const totalParts = Math.ceil(data.fileSize / PART_SIZE)
    const { uploadId } = await initMultipartUpload(data.key, data.contentType)
    return { mode: 'multipart' as const, key: data.key, uploadId, totalParts, partSize: PART_SIZE }
  })
