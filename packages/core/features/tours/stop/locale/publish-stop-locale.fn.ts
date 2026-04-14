import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { captureStudioProductEvent } from '../../../../posthog/server'
import { requireStopAccessByNanoId } from '../../../auth/authorization'
import { requireAuthMiddleware } from '../../../auth/middleware'
import { publishStopLocale } from './publish-stop-locale.server'

export type { PublishStopLocaleResult } from './publish-stop-locale.server'

const publishStopLocaleSchema = z.object({
  nanoId: z.string(),
  locale: z.string(),
})

export const publishStopLocaleFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(publishStopLocaleSchema)
  .handler(async ({ context, data }) => {
    await requireStopAccessByNanoId(data.nanoId, context.user.id)

    const result = await publishStopLocale(data.nanoId, data.locale, context.user.id)
    await captureStudioProductEvent({
      distinctId: context.user.id,
      event: 'stop.published',
      properties: {
        stop_nano_id: data.nanoId,
        locale: data.locale,
      },
    })
    return result
  })
