import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { adminMiddleware } from '../middleware'
import { backfillAllSlugsForOrg } from './kv-backfill-all-slugs-for-org.server'

export type { BackfillAllSlugsForOrgResult } from './kv-backfill-all-slugs-for-org.server'

export const kvBackfillAllSlugsForOrgFn = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator(z.object({ orgNanoId: z.string().min(1) }))
  .handler(async ({ data }) => {
    return backfillAllSlugsForOrg(data.orgNanoId)
  })
