import type { DB } from '@valguide/core/features/db'
import { eq } from 'drizzle-orm'
import { authUsers } from 'drizzle-orm/supabase'
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
