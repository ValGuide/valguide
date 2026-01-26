import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireGuideAccessByNanoId } from '../../../auth/authorization'
import { requireAuthMiddleware } from '../../../auth/middleware'
import { getGuideAssetsDraft } from './get-guide-assets-draft.server'

export type { GetGuideAssetsDraftResult, GuideAssetDraftItem } from './get-guide-assets-draft.server'

const getGuideAssetsDraftSchema = z.object({
  nanoId: z.string(),
  channel: z.string().optional(),
  locale: z.string().nullable().optional(),
})

export const getGuideAssetsDraftFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getGuideAssetsDraftSchema)
  .handler(async ({ context, data }) => {
    await requireGuideAccessByNanoId(data.nanoId, context.user.id)

    return getGuideAssetsDraft(data.nanoId, data.channel, data.locale)
  })
