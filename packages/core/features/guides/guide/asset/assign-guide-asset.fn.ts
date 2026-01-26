import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireGuideAccessByNanoId } from '../../../auth/authorization'
import { requireAuthMiddleware } from '../../../auth/middleware'
import { assignGuideAsset } from './assign-guide-asset.server'

export type { AssignGuideAssetInput, AssignGuideAssetResult } from './assign-guide-asset.server'

const assignGuideAssetSchema = z.object({
  nanoId: z.string(),
  assetId: z.string(),
  channel: z.string(),
  locale: z.string().nullable().optional(),
  position: z.number().optional(),
})

export const assignGuideAssetFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(assignGuideAssetSchema)
  .handler(async ({ context, data }) => {
    await requireGuideAccessByNanoId(data.nanoId, context.user.id)

    return assignGuideAsset(data.nanoId, {
      assetId: data.assetId,
      channel: data.channel,
      locale: data.locale,
      position: data.position,
    })
  })
