import { createServerFn } from '@tanstack/react-start'
import { db } from '@valguide/core/features/db'
import { requireAuthMiddleware } from '../auth/middleware'
import { getProfile } from '../profiles/get-profile.server'
import { getUserDisplayName } from '../profiles/utils'
import { type EnsureDefaultTeamResult, ensureDefaultTeam } from './ensure-default-team.server'

export type { EnsureDefaultTeamResult } from './ensure-default-team.server'

/**
 * Ensures the current user has at least one team.
 * Creates a default team if they don't have any.
 * Idempotent - safe to call multiple times (cached via React Query).
 */
export const ensureDefaultTeamFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .handler(async ({ context }): Promise<EnsureDefaultTeamResult> => {
    // Get user's display name for team naming

    const profile = await getProfile(context.user.id)
    const displayName = getUserDisplayName(profile, context.user.email)

    const team = await ensureDefaultTeam(db, context.user.id, displayName)

    return { teamId: team.id }
  })
