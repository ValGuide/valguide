import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { captureStudioProductEvent } from '../../../posthog/server'
import { requireStopAccessByNanoId } from '../../auth/authorization'
import { requireAuthMiddleware } from '../../auth/middleware'
import { discardAllStopChanges } from './discard-all-stop-changes.server'

const discardAllStopChangesSchema = z.object({
  nanoId: z.string(),
  locale: z.string(),
})

export const discardAllStopChangesFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(discardAllStopChangesSchema)
  .handler(async ({ context, data }) => {
    await requireStopAccessByNanoId(data.nanoId, context.user.id)

    const result = await discardAllStopChanges(data.nanoId, data.locale)
    await captureStudioProductEvent({
      distinctId: context.user.id,
      event: 'stop.discarded',
      properties: {
        stop_nano_id: data.nanoId,
        locale: data.locale,
        discard_scope: 'all_changes',
      },
    })
    return result
  })
