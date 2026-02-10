import { createServerFn } from '@tanstack/react-start'
import { db } from '@valguide/core/features/db'
import { getOrgMembership } from '../auth/authorization'
import { requireAuthMiddleware } from '../auth/middleware'
import { getOrCreateProfile } from '../profiles/get-or-create-profile.server'
import { getUserDisplayName } from '../profiles/utils'
import { getActiveTeamId, setActiveTeamId } from '../utils/cookies'
import { type EnsureDefaultTeamResult, ensureDefaultTeam } from './ensure-default-team.server'

export type { EnsureDefaultTeamResult } from './ensure-default-team.server'

/**
 * Ensures the current user has at least one team.
 * Creates a default team if they don't have any.
 * Also validates and sets the active-team-id cookie.
 * Idempotent - safe to call multiple times (cached via React Query).
 */
export const ensureDefaultTeamFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .handler(async ({ context }): Promise<EnsureDefaultTeamResult> => {
    const profile = await getOrCreateProfile(context.user.id, context.user.email)
    const displayName = getUserDisplayName(profile, context.user.email)

    const team = await ensureDefaultTeam(db, context.user.id, displayName)

    // Validate current cookie - if stale or missing, set to the default team
    const currentActiveTeamId = getActiveTeamId()
    if (!currentActiveTeamId) {
      setActiveTeamId(team.id)
    } else if (currentActiveTeamId !== team.id) {
      // Check if user is still a member of the cookie's team
      const membership = await getOrgMembership(context.user.id, currentActiveTeamId)
      if (!membership) {
        // Cookie points to invalid team - reset to default
        setActiveTeamId(team.id)
      }
    }

    return { teamId: team.id }
  })
