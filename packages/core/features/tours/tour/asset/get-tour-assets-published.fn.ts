import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireTourAccessByNanoId } from '../../../auth/authorization'
import { requireAuthMiddleware } from '../../../auth/middleware'
import { getTourAssetsPublished } from './get-tour-assets-published.server'

export type { GetTourAssetsPublishedResult, TourAssetPublishedItem } from './get-tour-assets-published.server'

const getTourAssetsPublishedSchema = z.object({
  nanoId: z.string(),
  channel: z.string().optional(),
  locale: z.string().nullable().optional(),
})

export const getTourAssetsPublishedFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getTourAssetsPublishedSchema)
  .handler(async ({ context, data }) => {
    await requireTourAccessByNanoId(data.nanoId, context!.user.id)

    return getTourAssetsPublished(data.nanoId, data.channel, data.locale)
  })
