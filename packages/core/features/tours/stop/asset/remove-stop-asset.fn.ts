import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { captureStudioProductEvent } from '../../../../posthog/server'
import { requireStopAccessByNanoId } from '../../../auth/authorization'
import { requireAuthMiddleware } from '../../../auth/middleware'
import { removeStopAsset } from './remove-stop-asset.server'

export type { RemoveStopAssetInput, RemoveStopAssetResult } from './remove-stop-asset.server'

const removeStopAssetSchema = z.object({
  nanoId: z.string(),
  assetId: z.string(),
  channel: z.string(),
  locale: z.string().nullable().optional(),
})

export const removeStopAssetFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(removeStopAssetSchema)
  .handler(async ({ context, data }) => {
    await requireStopAccessByNanoId(data.nanoId, context.user.id)

    const result = await removeStopAsset(data.nanoId, {
      assetId: data.assetId,
      channel: data.channel,
      locale: data.locale,
    })

    if (result.removed) {
      captureStudioProductEvent({
        distinctId: context.user.id,
        event: 'stop.asset_removed',
        properties: {
          stop_nano_id: data.nanoId,
          asset_nano_id: data.assetId,
          channel: data.channel,
          locale: data.locale ?? null,
        },
      })
    }

    return result
  })
