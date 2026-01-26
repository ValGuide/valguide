import type { DB } from '@valguide/core/features/db'
import { eq } from 'drizzle-orm'
import { createTeam } from './create-team.server'
import { organizationMember } from './schema'
import type { Organization } from './types'

// =============================================================================
// TYPES
// =============================================================================

export type EnsureDefaultTeamResult = {
  teamId: string
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

/**
 * Ensure user has at least one team, creating a default one if needed.
 * This is idempotent - safe to call multiple times.
 */
export async function ensureDefaultTeam(dbClient: DB, userId: string, userName?: string): Promise<Organization> {
  // Check if user already has any team
  const existingMembership = await dbClient.query.organizationMember.findFirst({
    where: eq(organizationMember.userId, userId),
    with: { organization: true },
  })

  if (existingMembership?.organization) {
    return existingMembership.organization
  }

  // Create a new team for the user using existing transactional createTeam
  const teamName = userName ? `${userName}'s Studio` : 'My Studio'
  const newTeam = await createTeam(dbClient, teamName, userId)

  return newTeam
}
