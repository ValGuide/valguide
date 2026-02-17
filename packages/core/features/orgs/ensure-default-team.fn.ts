import { createServerFn } from '@tanstack/react-start'
import { db } from '@valguide/core/features/db'
import { eq } from 'drizzle-orm'
import { getOrgMembership } from '../auth/authorization'
import { requireAuthMiddleware } from '../auth/middleware'
import { getOrCreateProfile } from '../profiles/get-or-create-profile.server'
import { getUserDisplayName } from '../profiles/utils'
import { getActiveTeamId, setActiveTeamId } from '../utils/cookies'
import { type EnsureDefaultTeamResult, ensureDefaultTeam } from './ensure-default-team.server'
import { organization } from './schema'

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

    const defaultResult = await ensureDefaultTeam(db, context.user.id, displayName)

    // Validate current cookie - if stale or missing, set to the default team
    const currentActiveTeamId = getActiveTeamId()
    if (!currentActiveTeamId) {
      setActiveTeamId(defaultResult.teamId)
      return defaultResult
    }

    if (currentActiveTeamId === defaultResult.teamId) {
      return defaultResult
    }

    // Cookie points to a different team - validate membership
    const membership = await getOrgMembership(context.user.id, currentActiveTeamId)
    if (!membership) {
      // Cookie points to invalid team - reset to default
      setActiveTeamId(defaultResult.teamId)
      return defaultResult
    }

    // Return the active team's data
    const [activeOrg] = await db
      .select({ id: organization.id, slug: organization.slug })
      .from(organization)
      .where(eq(organization.id, currentActiveTeamId))
      .limit(1)

    if (!activeOrg) {
      setActiveTeamId(defaultResult.teamId)
      return defaultResult
    }

    return { teamId: activeOrg.id, orgSlug: activeOrg.slug }
  })
