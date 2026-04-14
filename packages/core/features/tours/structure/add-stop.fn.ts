import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { captureStudioProductEvent } from '../../../posthog/server'
import { requireStopAccessByNanoId, requireTourAccessByNanoId } from '../../auth/authorization'
import { requireAuthMiddleware } from '../../auth/middleware'
import { addStopToTour } from './add-stop.server'

export type { AddStopToTourInput, AddStopToTourResult } from './add-stop.server'

const addStopToTourSchema = z.object({
  tourNanoId: z.string(),
  stopNanoId: z.string(),
  position: z.number().int().min(0).optional(),
})

export const addStopToTourFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(addStopToTourSchema)
  .handler(async ({ context, data }) => {
    // Verify access to both tour and stop
    await requireTourAccessByNanoId(data.tourNanoId, context.user.id)
    await requireStopAccessByNanoId(data.stopNanoId, context.user.id)

    const result = await addStopToTour(data)
    await captureStudioProductEvent({
      distinctId: context.user.id,
      event: 'tour.stop_added',
      properties: {
        tour_nano_id: data.tourNanoId,
        stop_nano_id: data.stopNanoId,
        position: data.position ?? null,
      },
    })
    return result
  })
