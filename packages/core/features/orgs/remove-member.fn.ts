import { createServerFn } from '@tanstack/react-start'
import { db } from '@valguide/core/features/db'
import { z } from 'zod'
import { requireOrgRole } from '../auth/authorization'
import { requireAuthMiddleware } from '../auth/middleware'
import { removeMember } from './remove-member.server'

const removeMemberSchema = z.object({
  memberId: z.string(),
  teamId: z.string(),
})

export const removeMemberFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(removeMemberSchema)
  .handler(async ({ context, data }) => {
    await requireOrgRole(data.teamId, context.user.id, 'admin')

    await removeMember(db, data.memberId)
  })
