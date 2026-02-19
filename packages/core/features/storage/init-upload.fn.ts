import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireAuthMiddleware } from '../auth/middleware'
import {
  createPresignedPutUrl,
  getPartUploadUrls,
  initMultipartUpload,
  MULTIPART_THRESHOLD,
  PART_SIZE,
} from './upload.server'

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
      const putUrl = await createPresignedPutUrl(data.key, data.contentType)
      return { mode: 'put' as const, key: data.key, putUrl }
    }

    const totalParts = Math.ceil(data.fileSize / PART_SIZE)
    const { uploadId } = await initMultipartUpload(data.key, data.contentType)
    const partUrls = await getPartUploadUrls(data.key, uploadId, totalParts)
    return { mode: 'multipart' as const, key: data.key, uploadId, partUrls, partSize: PART_SIZE }
  })
