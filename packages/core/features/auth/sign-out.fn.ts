import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { and, eq, ne } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '../db'
import { auth } from './better-auth.server'
import { authSessions } from './schema'
import { serializeAuthError } from './utils'

// ============================================================================
// SCHEMA
// ============================================================================

const signOutSchema = z.object({
  scope: z.enum(['global', 'local', 'others']).optional(),
})

// ============================================================================
// SERVER FUNCTION
// ============================================================================

/**
 * Sign out the current user.
 * Scope options:
 * - 'local': Sign out from current session only (default)
 * - 'global': Sign out from all sessions
 * - 'others': Sign out from all other sessions except current
 */
export const signOutFn = createServerFn({ method: 'POST' })
  .inputValidator(signOutSchema)
  .handler(async ({ data: options }) => {
    const headers = getRequestHeaders()
    const scope = options.scope ?? 'local'

    try {
      const sessionData = await auth.api.getSession({ headers })

      if (scope === 'others' && sessionData?.user?.id) {
        await db
          .delete(authSessions)
          .where(and(eq(authSessions.userId, sessionData.user.id), ne(authSessions.id, sessionData.session.id)))
        return { error: null }
      }

      await auth.api.signOut({ headers })

      if (scope === 'global' && sessionData?.user?.id) {
        await db.delete(authSessions).where(eq(authSessions.userId, sessionData.user.id))
      }

      return { error: null }
    } catch (error) {
      return { error: serializeAuthError(error) }
    }
  })
