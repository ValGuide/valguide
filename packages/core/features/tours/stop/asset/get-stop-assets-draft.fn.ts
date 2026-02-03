import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireStopAccessByNanoId } from '../../../auth/authorization'
import { requireAuthMiddleware } from '../../../auth/middleware'
import { getStopAssetsDraft } from './get-stop-assets-draft.server'

export type { GetStopAssetsDraftResult, StopAssetDraftItem } from './get-stop-assets-draft.server'

const getStopAssetsDraftSchema = z.object({
  nanoId: z.string(),
  channel: z.string().optional(),
  locale: z.string().nullable().optional(),
})

export const getStopAssetsDraftFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getStopAssetsDraftSchema)
  .handler(async ({ context, data }) => {
    await requireStopAccessByNanoId(data.nanoId, context.user.id)

    return getStopAssetsDraft(data.nanoId, data.channel, data.locale)
  })
