import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireGuideAccessByNanoId } from '../../../auth/authorization'
import { requireAuthMiddleware } from '../../../auth/middleware'
import { removeGuideAsset } from './remove-guide-asset.server'

export type { RemoveGuideAssetInput, RemoveGuideAssetResult } from './remove-guide-asset.server'

const removeGuideAssetSchema = z.object({
  nanoId: z.string(),
  assetId: z.string(),
  channel: z.string(),
  locale: z.string().nullable().optional(),
})

export const removeGuideAssetFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(removeGuideAssetSchema)
  .handler(async ({ context, data }) => {
    await requireGuideAccessByNanoId(data.nanoId, context.user.id)

    return removeGuideAsset(data.nanoId, {
      assetId: data.assetId,
      channel: data.channel,
      locale: data.locale,
    })
  })
