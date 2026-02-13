import { createServerFn } from '@tanstack/react-start'
import { db } from '@valguide/core/features/db'
import { z } from 'zod'
import { adminMiddleware } from '../middleware'
import { listUsers } from './list-users.server'

export type { AdminUserListItem, ListUsersInput, ListUsersResult } from './list-users.server'

const listUsersSchema = z.object({
  page: z.number().int().min(0).default(0),
  pageSize: z.number().int().min(1).max(200).default(20),
  search: z.string().optional(),
  status: z.enum(['pending', 'approved', 'blocked']).optional(),
  sortBy: z.enum(['email', 'name', 'status', 'createdAt', 'orgCount']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export const adminListUsersFn = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .inputValidator(listUsersSchema)
  .handler(async ({ data }) => {
    return listUsers(db, data)
  })
