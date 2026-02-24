import { createServerFn } from '@tanstack/react-start'
import { adminMiddleware } from '../middleware'
import { backfillTourSlugs } from './kv-backfill-tour-slugs.server'

export type { BackfillTourSlugsResult } from './kv-backfill-tour-slugs.server'

export const kvBackfillTourSlugsFn = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .handler(async () => {
    return backfillTourSlugs()
  })
