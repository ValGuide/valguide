import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { captureStudioProductEvent } from '../../../posthog/server'
import { requireStopAccessByNanoId, requireTourAccessByNanoId } from '../../auth/authorization'
import { requireAuthMiddleware } from '../../auth/middleware'
import { updateStopVisibility } from './update-stop-visibility.server'

export type { UpdateStopVisibilityInput, UpdateStopVisibilityResult } from './update-stop-visibility.server'

const updateStopVisibilitySchema = z.object({
  tourNanoId: z.string(),
  stopNanoId: z.string(),
  visible: z.boolean(),
})

export const updateStopVisibilityFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(updateStopVisibilitySchema)
  .handler(async ({ context, data }) => {
    await requireTourAccessByNanoId(data.tourNanoId, context.user.id)
    await requireStopAccessByNanoId(data.stopNanoId, context.user.id)

    const result = await updateStopVisibility(data)
    await captureStudioProductEvent({
      distinctId: context.user.id,
      event: data.visible ? 'tour.stop_shown' : 'tour.stop_hidden',
      properties: {
        tour_nano_id: data.tourNanoId,
        stop_nano_id: data.stopNanoId,
      },
    })
    return result
  })
