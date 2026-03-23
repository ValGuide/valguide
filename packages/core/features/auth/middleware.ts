import { redirect } from '@tanstack/react-router'
import { createMiddleware } from '@tanstack/react-start'
import { logStudioPerformance, timeStudioPerformance } from '../../utils/studio-performance'
import { resolveFirstOrgId } from '../orgs/resolve-active-org.server'
import { getAuthSession, setActiveOrganizationForCurrentSession } from './better-auth.server'
import { getUserStatus } from './get-user-status.server'

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
  const session = await timeStudioPerformance('auth.getAuthSession', async () => getAuthSession(), {
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
  .server(async ({ next, context }) => {
    if (!context.user) {
      throw redirect({ to: '/login' })
    }

    const user = context.user

    const status = await timeStudioPerformance('auth.getUserStatus', async () => getUserStatus(user.id, user.email), {
      stage: 'requireAuthMiddleware',
      userId: user.id,
    })
    if (status === 'pending') {
      throw redirect({ to: '/pending' })
    }
    if (status === 'blocked') {
      throw redirect({ to: '/blocked' })
    }

    // Resolve and persist an active organization when the session has not selected one yet.
    let activeOrgId = context.activeOrgId
    let activeOrgSource: 'session' | 'resolved' | 'missing' = activeOrgId ? 'session' : 'missing'
    if (!activeOrgId) {
      activeOrgId = await timeStudioPerformance('auth.resolveFirstOrgId', async () => resolveFirstOrgId(user.id), {
        stage: 'requireAuthMiddleware',
        userId: user.id,
      })
      if (activeOrgId) {
        activeOrgSource = 'resolved'
        await setActiveOrganizationForCurrentSession(activeOrgId)
      }
    }

    logStudioPerformance('auth.activeOrgId', {
      stage: 'requireAuthMiddleware',
      userId: user.id,
      source: activeOrgSource,
      hasActiveOrgId: !!activeOrgId,
    })

    return next({
      context: {
        user,
        activeOrgId,
      },
    })
  })
