import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireStopAccessByNanoId } from '../../../auth/authorization'
import { requireAuthMiddleware } from '../../../auth/middleware'
import { ensureAllStopLocalesForTour } from './ensure-all-stop-locales-for-tour.server'

export type { EnsureAllStopLocalesResult } from './ensure-all-stop-locales-for-tour.server'

const ensureAllStopLocalesForTourSchema = z.object({
  tourNanoId: z.string(),
  stopNanoId: z.string(),
})

export const ensureAllStopLocalesForTourFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(ensureAllStopLocalesForTourSchema)
  .handler(async ({ context, data }) => {
    await requireStopAccessByNanoId(data.stopNanoId, context.user.id)
    return ensureAllStopLocalesForTour(data.tourNanoId, data.stopNanoId)
  })
