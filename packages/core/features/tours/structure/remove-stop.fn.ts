import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
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

    return removeStopFromTour(data)
  })
