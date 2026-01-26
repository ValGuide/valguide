import { createServerFn } from '@tanstack/react-start'
import { db } from '@valguide/core/features/db'
import { z } from 'zod'
import { requireOrgMember } from '../auth/authorization'
import { requireAuthMiddleware } from '../auth/middleware'
import { getTeamMembers } from './get-team-members.server'

const getTeamMembersSchema = z.object({
  teamId: z.string(),
})

export const getTeamMembersFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getTeamMembersSchema)
  .handler(async ({ context, data }) => {
    await requireOrgMember(data.teamId, context.user.id)
    return getTeamMembers(db, data.teamId)
  })
