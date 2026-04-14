import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { captureStudioProductEvent } from '../../../../posthog/server'
import { requireTourAccessByNanoId } from '../../../auth/authorization'
import { requireAuthMiddleware } from '../../../auth/middleware'
import { assignTourAsset } from './assign-tour-asset.server'

export type { AssignTourAssetInput, AssignTourAssetResult } from './assign-tour-asset.server'

const assignTourAssetSchema = z.object({
  nanoId: z.string(),
  assetId: z.string(),
  channel: z.string(),
  locale: z.string().nullable().optional(),
  position: z.number().optional(),
})

export const assignTourAssetFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(assignTourAssetSchema)
  .handler(async ({ context, data }) => {
    await requireTourAccessByNanoId(data.nanoId, context.user.id)

    const result = await assignTourAsset(data.nanoId, {
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
          target_type: 'tour',
          target_nano_id: data.nanoId,
          channel: data.channel,
          locale: data.locale ?? null,
        },
      })
    }

    return result
  })
