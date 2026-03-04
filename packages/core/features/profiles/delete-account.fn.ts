import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { eq } from 'drizzle-orm'
import { auth } from '../auth/better-auth.server'
import { requireAuthMiddleware } from '../auth/middleware'
import { authSessions } from '../auth/schema'
import { db } from '../db'
import { deleteAccount } from './delete-account.server'

// =============================================================================
// SERVER FUNCTION
// =============================================================================

export const deleteAccountFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .handler(async ({ context }) => {
    await deleteAccount(context.user.id)

    await db.delete(authSessions).where(eq(authSessions.userId, context.user.id))
    await auth.api.signOut({ headers: getRequestHeaders() })

    return { success: true }
  })
