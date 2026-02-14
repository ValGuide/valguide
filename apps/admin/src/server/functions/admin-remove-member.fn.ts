import { createServerFn } from '@tanstack/react-start'
import { db } from '@valguide/core/features/db'
import { z } from 'zod'
import { adminMiddleware } from '../middleware'
import { adminRemoveMember } from './admin-remove-member.server'

export const adminRemoveMemberFn = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator(z.object({ memberId: z.string() }))
  .handler(async ({ data }) => {
    return adminRemoveMember(db, data.memberId)
  })
