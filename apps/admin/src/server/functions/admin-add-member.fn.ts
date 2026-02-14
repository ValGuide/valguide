import { createServerFn } from '@tanstack/react-start'
import { db } from '@valguide/core/features/db'
import { z } from 'zod'
import { adminMiddleware } from '../middleware'
import { adminAddMember } from './admin-add-member.server'

export type { AddMemberResult } from './admin-add-member.server'

export const adminAddMemberFn = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator(
    z.object({
      orgNanoId: z.string(),
      email: z.string().email(),
      role: z.enum(['owner', 'admin', 'curator', 'editor', 'viewer']),
    }),
  )
  .handler(async ({ data }) => {
    return adminAddMember(db, data)
  })
