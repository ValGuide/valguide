import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireTourAccessByNanoId } from '../../../auth/authorization'
import { requireAuthMiddleware } from '../../../auth/middleware'
import { getTourSettingsDraft } from './get-tour-settings-draft.server'

export type { TourSettingsDraftResult } from './get-tour-settings-draft.server'

const getTourSettingsDraftSchema = z.object({
  nanoId: z.string(),
})

export const getTourSettingsDraftFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getTourSettingsDraftSchema)
  .handler(async ({ context, data }) => {
    await requireTourAccessByNanoId(data.nanoId, context.user.id)

    return getTourSettingsDraft(data.nanoId)
  })
