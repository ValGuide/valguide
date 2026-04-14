import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { captureStudioProductEvent } from '../../../posthog/server'
import { requireTourAccessByNanoId } from '../../auth/authorization'
import { requireAuthMiddleware } from '../../auth/middleware'
import { discardAllTourChanges } from './discard-all-tour-changes.server'

const discardAllTourChangesSchema = z.object({
  nanoId: z.string(),
  locale: z.string(),
})

export const discardAllTourChangesFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(discardAllTourChangesSchema)
  .handler(async ({ context, data }) => {
    await requireTourAccessByNanoId(data.nanoId, context.user.id)

    const result = await discardAllTourChanges(data.nanoId, data.locale)
    await captureStudioProductEvent({
      distinctId: context.user.id,
      event: 'tour.discarded',
      properties: {
        tour_nano_id: data.nanoId,
        locale: data.locale,
        discard_scope: 'all_changes',
      },
    })

    return result
  })
