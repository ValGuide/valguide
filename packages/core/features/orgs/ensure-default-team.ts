import { createServerFn } from '@tanstack/react-start'
import { type DB, db } from '@valguide/core/features/db'
import { eq } from 'drizzle-orm'
import { requireAuthMiddleware } from '../auth/middleware'
import { createTeam } from './create-team'
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

// =============================================================================
// SERVER FUNCTION
// =============================================================================

/**
 * Ensures the current user has at least one team.
 * Creates a default team if they don't have any.
 * Idempotent - safe to call multiple times (cached via React Query).
 */
export const ensureDefaultTeamFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .handler(async ({ context }): Promise<EnsureDefaultTeamResult> => {
    // Get user's display name for team naming
    const { getProfile } = await import('../profiles/get-profile')
    const { getUserDisplayName } = await import('../profiles/utils')

    const profile = await getProfile(context.user.id)
    const displayName = getUserDisplayName(profile, context.user.email)

    const team = await ensureDefaultTeam(db, context.user.id, displayName)

    return { teamId: team.id }
  })
