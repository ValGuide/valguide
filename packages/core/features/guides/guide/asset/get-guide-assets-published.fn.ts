import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireGuideAccessByNanoId } from '../../../auth/authorization'
import { requireAuthMiddleware } from '../../../auth/middleware'
import { getGuideAssetsPublished } from './get-guide-assets-published.server'

export type { GetGuideAssetsPublishedResult, GuideAssetPublishedItem } from './get-guide-assets-published.server'

const getGuideAssetsPublishedSchema = z.object({
  nanoId: z.string(),
  channel: z.string().optional(),
  locale: z.string().nullable().optional(),
})

export const getGuideAssetsPublishedFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getGuideAssetsPublishedSchema)
  .handler(async ({ context, data }) => {
    await requireGuideAccessByNanoId(data.nanoId, context!.user.id)

    return getGuideAssetsPublished(data.nanoId, data.channel, data.locale)
  })
