import type { DB } from '@valguide/core/features/db'
import { eq } from 'drizzle-orm'
import { authUsers } from '../auth/schema'
import { profiles } from '../profiles/schema'
import { member } from './schema'

// =============================================================================
// TYPES
// =============================================================================

export type TeamMemberWithDetails = {
  member: typeof member.$inferSelect
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
      member,
      profile: profiles,
      user: authUsers,
    })
    .from(member)
    .leftJoin(profiles, eq(member.userId, profiles.id))
    .leftJoin(authUsers, eq(member.userId, authUsers.id))
    .where(eq(member.organizationId, teamId))
}
