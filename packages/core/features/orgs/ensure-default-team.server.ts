import type { DB } from '@valguide/core/features/db'
import { eq } from 'drizzle-orm'
import { timePerformance } from '../../utils/performance'
import { createTeam } from './create-team.server'
import { member } from './schema'

// =============================================================================
// TYPES
// =============================================================================

export type EnsureDefaultTeamResult = {
  teamId: string
  orgSlug: string
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

/**
 * Ensure user has at least one team, creating a default one if needed.
 * This is idempotent - safe to call multiple times.
 * Returns both the teamId and the org's primary slug.
 */
export async function ensureDefaultTeam(
  dbClient: DB,
  userId: string,
  userName?: string,
): Promise<EnsureDefaultTeamResult> {
  // Check if user already has any team
  const existingMembership = await timePerformance(
    'orgs.ensureDefaultTeam.membershipLookup',
    async () =>
      dbClient.query.member.findFirst({
        where: eq(member.userId, userId),
        with: { organization: true },
      }),
    { userId },
  )

  if (existingMembership?.organization) {
    return { teamId: existingMembership.organization.id, orgSlug: existingMembership.organization.slug }
  }

  // Create a new team for the user using existing transactional createTeam
  const teamName = userName ? `${userName}'s Studio` : 'My Studio'
  const { team, orgSlug } = await timePerformance(
    'orgs.ensureDefaultTeam.createTeam',
    async () => createTeam(dbClient, teamName, userId),
    { userId },
  )

  return { teamId: team.id, orgSlug }
}
