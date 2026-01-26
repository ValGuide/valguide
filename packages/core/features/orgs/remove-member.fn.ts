import { createServerFn } from '@tanstack/react-start'
import { type DB, db } from '@valguide/core/features/db'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { requireOrgRole } from '../auth/authorization'
import { requireAuthMiddleware } from '../auth/middleware'
import { organizationMember } from './schema'

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

/**
 * Remove a member from a team
 */
export async function removeMember(dbClient: DB, memberId: string) {
  return dbClient.delete(organizationMember).where(eq(organizationMember.id, memberId))
}

// =============================================================================
// SERVER FUNCTION
// =============================================================================

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
