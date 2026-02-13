import { createMiddleware } from '@tanstack/react-start'
import { createAdminClient } from './supabase'
import { isSuperadmin } from './utils/superadmin'

/**
 * Global function middleware added to start.ts functionMiddleware[].
 * Runs on EVERY server function in the admin app.
 *
 * If authenticated, verifies superadmin status — non-superadmin users are blocked.
 * If not authenticated, allows through so the login function can work.
 * The per-function `adminMiddleware` provides the "must be authenticated" requirement.
 */
export const globalAdminMiddleware = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    const supabase = await createAdminClient()
    const { data } = await supabase.auth.getClaims()

    // If authenticated, verify superadmin status
    // If not authenticated, allow through (login function needs this)
    if (data?.claims?.sub) {
      const email = data.claims.email as string | undefined
      if (!isSuperadmin(email)) {
        throw new Error('Forbidden: superadmin access required')
      }
    }

    return next()
  },
)

/**
 * Per-function middleware for explicit intent in individual .fn.ts files.
 * Provides typed auth context to handlers.
 * Defense in depth — globalAdminMiddleware already blocks unauthorized access.
 */
export const adminMiddleware = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    const supabase = await createAdminClient()
    const { data } = await supabase.auth.getClaims()

    if (!data?.claims?.sub) {
      throw new Error('Unauthorized: admin authentication required')
    }

    const email = data.claims.email as string | undefined
    if (!isSuperadmin(email)) {
      throw new Error('Forbidden: superadmin access required')
    }

    const user = {
      id: data.claims.sub,
      email: data.claims.email as string,
    }

    return next({ context: { user } })
  },
)
