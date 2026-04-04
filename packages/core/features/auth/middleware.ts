import { redirect } from '@tanstack/react-router'
import { createMiddleware } from '@tanstack/react-start'
import { timePerformance } from '../../utils/performance'

// ============================================================================
// Types
// ============================================================================

export type AuthUser = {
  id: string
  email?: string
  metadata?: unknown
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
 * Extracts user and active organization directly from the Better Auth session.
 * Use this for routes that need optional auth (public pages with conditional UI).
 */
export const authContextMiddleware = createMiddleware({ type: 'function' }).server(async ({ next }) => {
  const { getAuthSession } = await import('./better-auth.server')
  const session = await timePerformance('auth.getAuthSession', async () => getAuthSession(), {
    stage: 'authContextMiddleware',
  })

  const user: AuthUser | null = session?.user?.id
    ? {
        id: session.user.id,
        email: session.user.email,
      }
    : null

  const activeOrgId =
    (session?.session as { activeOrganizationId?: string | null } | undefined)?.activeOrganizationId ?? null

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
  .server(async ({ next }) => {
    const { getProtectedSessionBootstrap } = await import('./get-protected-session-bootstrap.server')
    const bootstrap = await getProtectedSessionBootstrap('requireAuthMiddleware')

    if (!bootstrap.user) {
      throw redirect({ to: '/login' })
    }

    if (bootstrap.status === 'pending') {
      throw redirect({ to: '/pending' })
    }
    if (bootstrap.status === 'blocked' || bootstrap.status === 'deactivated') {
      throw redirect({ to: '/blocked' })
    }

    return next({
      context: {
        user: bootstrap.user,
        activeOrgId: bootstrap.activeOrgId,
      },
    })
  })
