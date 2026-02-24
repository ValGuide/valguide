import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { adminMiddleware } from '../middleware'
import { backfillTour } from './kv-backfill-tour.server'

export type { BackfillTourResult } from './kv-backfill-tour.server'

export const kvBackfillTourFn = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator(z.object({ tourNanoId: z.string() }))
  .handler(async ({ data }) => {
    return backfillTour(data.tourNanoId)
  })
