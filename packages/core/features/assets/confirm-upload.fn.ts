import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireOrgMember } from '../auth/authorization'
import { requireAuthMiddleware } from '../auth/middleware'
import { confirmUpload } from './confirm-upload.server'

export type { ConfirmUploadInput, ConfirmUploadResult } from './confirm-upload.server'

const confirmUploadSchema = z.object({
  assetId: z.string(),
  fileName: z.string(),
  fileSize: z.number(),
  mimeType: z.string(),
  type: z.enum(['image', 'audio', 'video']),
  storagePath: z.string(),
  width: z.number().optional(),
  height: z.number().optional(),
  duration: z.number().optional(),
})

export const confirmAssetUploadFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(confirmUploadSchema)
  .handler(async ({ context, data }) => {
    const organizationId = context.activeOrgId
    if (!organizationId) {
      throw new Error('No active organization')
    }
    await requireOrgMember(organizationId, context.user.id)
    return confirmUpload(data, organizationId, context.user.id)
  })
