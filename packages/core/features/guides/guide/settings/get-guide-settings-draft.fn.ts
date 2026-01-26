import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireGuideAccessByNanoId } from '../../../auth/authorization'
import { requireAuthMiddleware } from '../../../auth/middleware'
import { getGuideSettingsDraft } from './get-guide-settings-draft.server'

export type { GuideSettingsDraftResult } from './get-guide-settings-draft.server'

const getGuideSettingsDraftSchema = z.object({
  nanoId: z.string(),
})

export const getGuideSettingsDraftFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getGuideSettingsDraftSchema)
  .handler(async ({ context, data }) => {
    await requireGuideAccessByNanoId(data.nanoId, context.user.id)

    return getGuideSettingsDraft(data.nanoId)
  })
