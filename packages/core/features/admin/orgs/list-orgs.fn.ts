import { createServerFn } from '@tanstack/react-start'
import { db } from '@valguide/core/features/db'
import { z } from 'zod'
import { requireSuperadminMiddleware } from '../middleware'
import { listOrgs } from './list-orgs.server'

export type { AdminOrgListItem, ListOrgsInput, ListOrgsResult } from './list-orgs.server'

const listOrgsSchema = z.object({
  page: z.number().int().min(0).default(0),
  pageSize: z.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'memberCount', 'tourCount', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export const adminListOrgsFn = createServerFn({ method: 'GET' })
  .middleware([requireSuperadminMiddleware])
  .inputValidator(listOrgsSchema)
  .handler(async ({ data }) => {
    return listOrgs(db, data)
  })
