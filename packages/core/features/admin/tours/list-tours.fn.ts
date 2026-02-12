import { createServerFn } from '@tanstack/react-start'
import { db } from '@valguide/core/features/db'
import { z } from 'zod'
import { requireSuperadminMiddleware } from '../middleware'
import { listTours } from './list-tours.server'

export type { AdminTourListItem, ListToursInput, ListToursResult } from './list-tours.server'

const listToursSchema = z.object({
  page: z.number().int().min(0).default(0),
  pageSize: z.number().int().min(1).max(200).default(20),
  search: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  sortBy: z.enum(['title', 'organizationName', 'stopCount', 'createdAt', 'publishedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export const adminListToursFn = createServerFn({ method: 'GET' })
  .middleware([requireSuperadminMiddleware])
  .inputValidator(listToursSchema)
  .handler(async ({ data }) => {
    return listTours(db, data)
  })
