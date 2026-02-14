import { createServerFn } from '@tanstack/react-start'
import { db } from '@valguide/core/features/db'
import { z } from 'zod'
import { adminMiddleware } from '../middleware'
import { getOrgDetail } from './get-org-detail.server'

export type { AdminOrgDetail } from './get-org-detail.server'

export const adminGetOrgDetailFn = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .inputValidator(z.object({ nanoId: z.string() }))
  .handler(async ({ data }) => {
    return getOrgDetail(db, data.nanoId)
  })
