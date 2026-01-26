import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireGuideAccessByNanoId } from '../../../auth/authorization'
import { requireAuthMiddleware } from '../../../auth/middleware'
import { publishGuideAssets } from './publish-guide-assets.server'

export type { PublishGuideAssetsInput, PublishGuideAssetsResult } from './publish-guide-assets.server'

const publishGuideAssetsSchema = z.object({
  nanoId: z.string(),
  channel: z.string(),
  locale: z.string().nullable().optional(),
})

export const publishGuideAssetsFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(publishGuideAssetsSchema)
  .handler(async ({ context, data }) => {
    await requireGuideAccessByNanoId(data.nanoId, context.user.id)

    return publishGuideAssets(data.nanoId, {
      channel: data.channel,
      locale: data.locale,
    })
  })
