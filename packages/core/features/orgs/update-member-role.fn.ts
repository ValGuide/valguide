import { createServerFn } from '@tanstack/react-start'
import { db } from '@valguide/core/features/db'
import { z } from 'zod'
import { requireOrgRole } from '../auth/authorization'
import { requireAuthMiddleware } from '../auth/middleware'
import { ORG_ROLES, type OrgRole } from './schema'
import { updateMemberRole } from './update-member-role.server'

const updateMemberRoleSchema = z.object({
  memberId: z.string(),
  teamId: z.string(),
  newRole: z.enum(ORG_ROLES),
})

export const updateMemberRoleFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(updateMemberRoleSchema)
  .handler(async ({ context, data }) => {
    await requireOrgRole(data.teamId, context.user.id, 'admin')

    await updateMemberRole(db, data.memberId, data.newRole as OrgRole)
  })
