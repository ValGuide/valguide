import { createServerFn } from '@tanstack/react-start'
import { adminMiddleware } from '../middleware'
import { backfillAllTours } from './kv-backfill-all-tours.server'

export type { BackfillAllToursResult } from './kv-backfill-all-tours.server'

export const kvBackfillAllToursFn = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .handler(async () => {
    return backfillAllTours()
  })
