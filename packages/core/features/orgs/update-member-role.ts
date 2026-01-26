import { createServerFn } from '@tanstack/react-start'
import { type DB, db } from '@valguide/core/features/db'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { requireOrgRole } from '../auth/authorization'
import { requireAuthMiddleware } from '../auth/middleware'
import { ORG_ROLES, type OrgRole, organizationMember } from './schema'

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

/**
 * Update a member's role
 */
export async function updateMemberRole(dbClient: DB, memberId: string, role: OrgRole) {
  return dbClient.update(organizationMember).set({ role }).where(eq(organizationMember.id, memberId))
}

// =============================================================================
// SERVER FUNCTION
// =============================================================================

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
