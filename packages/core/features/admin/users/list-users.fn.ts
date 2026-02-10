import { createServerFn } from '@tanstack/react-start'
import { db } from '@valguide/core/features/db'
import { z } from 'zod'
import { requireSuperadminMiddleware } from '../middleware'
import { listUsers } from './list-users.server'

export type { AdminUserListItem } from './list-users.server'

const listUsersSchema = z.object({
  status: z.enum(['pending', 'approved', 'blocked']).optional(),
})

export const adminListUsersFn = createServerFn({ method: 'GET' })
  .middleware([requireSuperadminMiddleware])
  .inputValidator(listUsersSchema)
  .handler(async ({ data }) => {
    return listUsers(db, data)
  })
