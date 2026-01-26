import { createServerFn } from '@tanstack/react-start'
import { type DB, db } from '@valguide/core/features/db'
import { eq } from 'drizzle-orm'
import { authUsers } from 'drizzle-orm/supabase'
import { z } from 'zod'
import { requireOrgMember } from '../auth/authorization'
import { requireAuthMiddleware } from '../auth/middleware'
import { profiles } from '../profiles/schema'
import { organizationMember } from './schema'

// =============================================================================
// TYPES
// =============================================================================

export type TeamMemberWithDetails = {
  member: typeof organizationMember.$inferSelect
  profile: typeof profiles.$inferSelect | null
  user: typeof authUsers.$inferSelect | null
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

/**
 * Get team members with profile details
 */
export async function getTeamMembers(dbClient: DB, teamId: string): Promise<TeamMemberWithDetails[]> {
  return dbClient
    .select({
      member: organizationMember,
      profile: profiles,
      user: authUsers,
    })
    .from(organizationMember)
    .leftJoin(profiles, eq(organizationMember.userId, profiles.id))
    .leftJoin(authUsers, eq(organizationMember.userId, authUsers.id))
    .where(eq(organizationMember.organizationId, teamId))
}

// =============================================================================
// SERVER FUNCTION
// =============================================================================

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
