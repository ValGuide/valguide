import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireGuideAccessByNanoId } from '../../../auth/authorization'
import { requireAuthMiddleware } from '../../../auth/middleware'
import { publishGuideSettings } from './publish-guide-settings.server'

export type { PublishGuideSettingsResult } from './publish-guide-settings.server'

const publishGuideSettingsSchema = z.object({
  nanoId: z.string(),
})

export const publishGuideSettingsFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(publishGuideSettingsSchema)
  .handler(async ({ context, data }) => {
    await requireGuideAccessByNanoId(data.nanoId, context.user.id)

    return publishGuideSettings(data.nanoId, context.user.id)
  })
