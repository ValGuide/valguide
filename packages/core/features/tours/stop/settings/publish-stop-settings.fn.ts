import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { captureStudioProductEvent } from '../../../../posthog/server'
import { requireStopAccessByNanoId } from '../../../auth/authorization'
import { requireAuthMiddleware } from '../../../auth/middleware'
import { publishStopSettings } from './publish-stop-settings.server'

export type { PublishStopSettingsResult } from './publish-stop-settings.server'

const publishStopSettingsSchema = z.object({
  nanoId: z.string(),
})

export const publishStopSettingsFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(publishStopSettingsSchema)
  .handler(async ({ context, data }) => {
    await requireStopAccessByNanoId(data.nanoId, context.user.id)

    const result = await publishStopSettings(data.nanoId, context.user.id)
    captureStudioProductEvent({
      distinctId: context.user.id,
      event: 'stop.settings_published',
      properties: {
        stop_nano_id: data.nanoId,
      },
    })
    return result
  })
