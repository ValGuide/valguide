import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireStopAccessByNanoId } from '../../../auth/authorization'
import { requireAuthMiddleware } from '../../../auth/middleware'
import { publishStopAssets } from './publish-stop-assets.server'

export type { PublishStopAssetsInput, PublishStopAssetsResult } from './publish-stop-assets.server'

const publishStopAssetsSchema = z.object({
  nanoId: z.string(),
  channel: z.string(),
  locale: z.string().nullable().optional(),
})

export const publishStopAssetsFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(publishStopAssetsSchema)
  .handler(async ({ context, data }) => {
    await requireStopAccessByNanoId(data.nanoId, context.user.id)

    return publishStopAssets(data.nanoId, {
      channel: data.channel,
      locale: data.locale,
    })
  })
