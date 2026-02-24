import { createServerFn } from '@tanstack/react-start'
import { adminMiddleware } from '../middleware'
import { backfillOrgSlugs } from './kv-backfill-org-slugs.server'

export type { BackfillOrgSlugsResult } from './kv-backfill-org-slugs.server'

export const kvBackfillOrgSlugsFn = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .handler(async () => {
    return backfillOrgSlugs()
  })
