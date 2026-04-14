import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { captureStudioProductEvent } from '../../../posthog/server'
import { requireTourAccessByNanoId } from '../../auth/authorization'
import { requireAuthMiddleware } from '../../auth/middleware'
import { removeStopFromTour } from './remove-stop.server'

export type { RemoveStopFromTourInput, RemoveStopFromTourResult } from './remove-stop.server'

const removeStopFromTourSchema = z.object({
  tourNanoId: z.string(),
  stopNanoId: z.string(),
})

export const removeStopFromTourFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(removeStopFromTourSchema)
  .handler(async ({ context, data }) => {
    await requireTourAccessByNanoId(data.tourNanoId, context.user.id)

    const result = await removeStopFromTour(data)
    captureStudioProductEvent({
      distinctId: context.user.id,
      event: 'tour.stop_removed',
      properties: {
        tour_nano_id: data.tourNanoId,
        stop_nano_id: data.stopNanoId,
      },
    })
    return result
  })
