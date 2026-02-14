import { createServerFn } from '@tanstack/react-start'
import { db } from '@valguide/core/features/db'
import { z } from 'zod'
import { adminMiddleware } from '../middleware'
import { adminUpdateMemberRole } from './admin-update-member-role.server'

export const adminUpdateMemberRoleFn = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator(
    z.object({
      memberId: z.string(),
      role: z.enum(['owner', 'admin', 'curator', 'editor', 'viewer']),
    }),
  )
  .handler(async ({ data }) => {
    return adminUpdateMemberRole(db, data.memberId, data.role)
  })
