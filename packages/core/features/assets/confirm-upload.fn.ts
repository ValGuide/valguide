import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getFileSizeBucket } from '../../posthog/product-analytics'
import { captureStudioProductEvent } from '../../posthog/server'
import { requireAuthMiddleware } from '../auth/middleware'

export type { ConfirmUploadInput, ConfirmUploadResult } from './confirm-upload.server'

const confirmUploadSchema = z.object({
  assetId: z.string(),
  fileName: z.string(),
  fileSize: z.number(),
  mimeType: z.string(),
  type: z.enum(['image', 'audio', 'video', 'document']),
  storagePath: z.string(),
  width: z.number().optional(),
  height: z.number().optional(),
  duration: z.number().optional(),
})

export const confirmAssetUploadFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(confirmUploadSchema)
  .handler(async ({ context, data }) => {
    const [{ requireOrgMember }, { confirmUpload }] = await Promise.all([
      import('../auth/authorization'),
      import('./confirm-upload.server'),
    ])

    const organizationId = context.activeOrgId
    if (!organizationId) {
      throw new Error('No active organization')
    }
    await requireOrgMember(organizationId, context.user.id)
    const asset = await confirmUpload(data, organizationId, context.user.id)
    await captureStudioProductEvent({
      distinctId: context.user.id,
      event: 'asset.upload_completed',
      properties: {
        asset_nano_id: asset.nanoId,
        asset_kind: asset.type,
        file_size_bucket: getFileSizeBucket(asset.fileSize),
        upload_source: 'studio',
      },
    })
    return asset
  })
