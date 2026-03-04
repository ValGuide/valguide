import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireStopAccessByNanoId } from '../../../auth/authorization'
import { requireAuthMiddleware } from '../../../auth/middleware'
import { getStopAssetsPublished } from './get-stop-assets-published.server'

export type { GetStopAssetsPublishedResult, StopAssetPublishedItem } from './get-stop-assets-published.server'

const getStopAssetsPublishedSchema = z.object({
  nanoId: z.string(),
  channel: z.string().optional(),
  locale: z.string().nullable().optional(),
})

export const getStopAssetsPublishedFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getStopAssetsPublishedSchema)
  .handler(async ({ context, data }) => {
    if (!context?.user?.id) {
      throw new Error('Unauthorized')
    }
    await requireStopAccessByNanoId(data.nanoId, context.user.id)

    return getStopAssetsPublished(data.nanoId, data.channel, data.locale)
  })
