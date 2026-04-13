import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { captureStudioProductEvent } from '../../../../posthog/server'
import { requireTourAccessByNanoId } from '../../../auth/authorization'
import { requireAuthMiddleware } from '../../../auth/middleware'
import { removeTourAsset } from './remove-tour-asset.server'

export type { RemoveTourAssetInput, RemoveTourAssetResult } from './remove-tour-asset.server'

const removeTourAssetSchema = z.object({
  nanoId: z.string(),
  assetId: z.string(),
  channel: z.string(),
  locale: z.string().nullable().optional(),
})

export const removeTourAssetFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(removeTourAssetSchema)
  .handler(async ({ context, data }) => {
    await requireTourAccessByNanoId(data.nanoId, context.user.id)

    const result = await removeTourAsset(data.nanoId, {
      assetId: data.assetId,
      channel: data.channel,
      locale: data.locale,
    })

    if (result.removed) {
      await captureStudioProductEvent({
        distinctId: context.user.id,
        event: 'tour.asset_removed',
        properties: {
          tour_nano_id: data.nanoId,
          asset_nano_id: data.assetId,
          channel: data.channel,
          locale: data.locale ?? null,
        },
      })
    }

    return result
  })
