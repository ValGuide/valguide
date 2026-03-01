import { redirect } from '@tanstack/react-router'
import { createMiddleware } from '@tanstack/react-start'
import { resolveFirstOrgId } from '../orgs/resolve-active-org.server'
import { getActiveTeamId, setActiveTeamId } from '../utils/cookies'
import { getAuthSession } from './better-auth.server'
import { getUserStatus } from './get-user-status.server'

// ============================================================================
// Types
// ============================================================================

export type AuthUser = {
  id: string
  email?: string
  metadata?: any
}

export type AuthContext = {
  user: AuthUser | null
  activeOrgId: string | null
}

export type RequiredAuthContext = {
  user: AuthUser
  activeOrgId: string | null
}

// ============================================================================
// Base Middleware - Extracts auth context (doesn't throw)
// ============================================================================

/**
 * Extracts user from Better Auth session and activeOrgId from cookie.
 * Use this for routes that need optional auth (public pages with conditional UI).
 */
export const authContextMiddleware = createMiddleware({ type: 'function' }).server(async ({ next }) => {
  const session = await getAuthSession()

  const user: AuthUser | null = session?.user?.id
    ? {
        id: session.user.id,
        email: session.user.email,
      }
    : null

  // Get active org from cookie (set when user switches teams)
  // Uses team ID (not slug) because slugs can change
  const activeOrgId = getActiveTeamId() ?? null

  return next({ context: { user, activeOrgId } })
})

// ============================================================================
// Enforcement Middleware - Requires authenticated + approved user
// ============================================================================

/**
 * Requires authenticated user with approved status.
 * Redirects to /login if not authenticated, /pending or /blocked based on profile status.
 * Use this for all protected server functions.
 */
export const requireAuthMiddleware = createMiddleware({ type: 'function' })
  .middleware([authContextMiddleware])
  .server(async ({ next, context }) => {
    if (!context.user) {
      throw redirect({ to: '/login' })
    }

    const status = await getUserStatus(context.user.id, context.user.email)
    if (status === 'pending') {
      throw redirect({ to: '/pending' })
    }
    if (status === 'blocked') {
      throw redirect({ to: '/blocked' })
    }

    // Resolve active org if cookie was missing (e.g., first SSR pass after login)
    let activeOrgId = context.activeOrgId
    if (!activeOrgId) {
      activeOrgId = await resolveFirstOrgId(context.user.id)
      if (activeOrgId) {
        setActiveTeamId(activeOrgId)
      }
    }

    return next({
      context: {
        user: context.user,
        activeOrgId,
      },
    })
  })
