import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireTourAccessByNanoId } from '../../../auth/authorization'
import { requireAuthMiddleware } from '../../../auth/middleware'
import { getTourAssetsDraft } from './get-tour-assets-draft.server'

export type { GetTourAssetsDraftResult, TourAssetDraftItem } from './get-tour-assets-draft.server'

const getTourAssetsDraftSchema = z.object({
  nanoId: z.string(),
  channel: z.string().optional(),
  locale: z.string().nullable().optional(),
})

export const getTourAssetsDraftFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getTourAssetsDraftSchema)
  .handler(async ({ context, data }) => {
    await requireTourAccessByNanoId(data.nanoId, context.user.id)

    return getTourAssetsDraft(data.nanoId, data.channel, data.locale)
  })
