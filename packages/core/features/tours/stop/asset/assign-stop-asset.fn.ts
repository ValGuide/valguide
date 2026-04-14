import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { captureStudioProductEvent } from '../../../../posthog/server'
import { requireStopAccessByNanoId } from '../../../auth/authorization'
import { requireAuthMiddleware } from '../../../auth/middleware'
import { assignStopAsset } from './assign-stop-asset.server'

export type { AssignStopAssetInput, AssignStopAssetResult } from './assign-stop-asset.server'

const assignStopAssetSchema = z.object({
  nanoId: z.string(),
  assetId: z.string(),
  channel: z.string(),
  locale: z.string().nullable().optional(),
  position: z.number().optional(),
})

export const assignStopAssetFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(assignStopAssetSchema)
  .handler(async ({ context, data }) => {
    await requireStopAccessByNanoId(data.nanoId, context.user.id)

    const result = await assignStopAsset(data.nanoId, {
      assetId: data.assetId,
      channel: data.channel,
      locale: data.locale,
      position: data.position,
    })

    if (result.assigned) {
      captureStudioProductEvent({
        distinctId: context.user.id,
        event: 'asset.attached',
        properties: {
          asset_nano_id: data.assetId,
          target_type: 'stop',
          target_nano_id: data.nanoId,
          channel: data.channel,
          locale: data.locale ?? null,
        },
      })
    }

    return result
  })
