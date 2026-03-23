import { createServerFn } from '@tanstack/react-start'
import { db } from '@valguide/core/features/db'
import { eq } from 'drizzle-orm'
import { logPerformance, timePerformance } from '../../utils/performance'
import { getOrgMembership } from '../auth/authorization'
import { setActiveOrganizationForCurrentSession } from '../auth/better-auth.server'
import { requireAuthMiddleware } from '../auth/middleware'
import { getOrCreateProfile } from '../profiles/get-or-create-profile.server'
import { getUserDisplayName } from '../profiles/utils'
import { type EnsureDefaultTeamResult, ensureDefaultTeam } from './ensure-default-team.server'
import { organization } from './schema'

export type { EnsureDefaultTeamResult } from './ensure-default-team.server'

/**
 * Ensures the current user has at least one team.
 * Creates a default team if they don't have any.
 * Also validates and sets the active organization in the Better Auth session.
 * Idempotent - safe to call multiple times (cached via React Query).
 */
export const ensureDefaultTeamFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .handler(async ({ context }): Promise<EnsureDefaultTeamResult> => {
    return timePerformance(
      'orgs.ensureDefaultTeamFn.total',
      async () => {
        const profile = await timePerformance(
          'orgs.ensureDefaultTeamFn.getOrCreateProfile',
          async () => getOrCreateProfile(context.user.id, context.user.email),
          { userId: context.user.id },
        )
        const displayName = getUserDisplayName(profile, context.user.email)

        const defaultResult = await timePerformance(
          'orgs.ensureDefaultTeamFn.ensureDefaultTeam',
          async () => ensureDefaultTeam(db, context.user.id, displayName),
          { userId: context.user.id },
        )

        // Validate active organization from session - if stale or missing, reset to default.
        const currentActiveOrgId = context.activeOrgId
        if (!currentActiveOrgId) {
          logPerformance('orgs.ensureDefaultTeamFn.activeOrg', {
            userId: context.user.id,
            source: 'missing',
            action: 'set-default',
            defaultTeamId: defaultResult.teamId,
          })
          await setActiveOrganizationForCurrentSession(defaultResult.teamId)
          return defaultResult
        }

        if (currentActiveOrgId === defaultResult.teamId) {
          logPerformance('orgs.ensureDefaultTeamFn.activeOrg', {
            userId: context.user.id,
            source: 'session',
            action: 'reuse-default',
            activeOrgId: currentActiveOrgId,
          })
          return defaultResult
        }

        // Session points to a different team - validate membership.
        const membership = await timePerformance(
          'orgs.ensureDefaultTeamFn.getOrgMembership',
          async () => getOrgMembership(context.user.id, currentActiveOrgId),
          {
            userId: context.user.id,
            activeOrgId: currentActiveOrgId,
          },
        )
        if (!membership) {
          logPerformance('orgs.ensureDefaultTeamFn.activeOrg', {
            userId: context.user.id,
            source: 'session',
            action: 'reset-invalid-membership',
            activeOrgId: currentActiveOrgId,
            defaultTeamId: defaultResult.teamId,
          })
          await setActiveOrganizationForCurrentSession(defaultResult.teamId)
          return defaultResult
        }

        // Return the active team's data
        const [activeOrg] = await timePerformance(
          'orgs.ensureDefaultTeamFn.activeOrgLookup',
          async () =>
            db
              .select({ id: organization.id, slug: organization.slug })
              .from(organization)
              .where(eq(organization.id, currentActiveOrgId))
              .limit(1),
          {
            userId: context.user.id,
            activeOrgId: currentActiveOrgId,
          },
        )

        if (!activeOrg) {
          logPerformance('orgs.ensureDefaultTeamFn.activeOrg', {
            userId: context.user.id,
            source: 'session',
            action: 'reset-missing-org',
            activeOrgId: currentActiveOrgId,
            defaultTeamId: defaultResult.teamId,
          })
          await setActiveOrganizationForCurrentSession(defaultResult.teamId)
          return defaultResult
        }

        logPerformance('orgs.ensureDefaultTeamFn.activeOrg', {
          userId: context.user.id,
          source: 'session',
          action: 'reuse-active-org',
          activeOrgId: currentActiveOrgId,
        })

        return { teamId: activeOrg.id, orgSlug: activeOrg.slug }
      },
      { userId: context.user.id },
    )
  })
