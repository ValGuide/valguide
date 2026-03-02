import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { serializeAuthError } from '@valguide/core/features/auth/utils'
import { adminAuth } from '../admin-auth.server'

/**
 * Sign out the current admin session.
 * Uses the dedicated admin auth cookie namespace.
 */
export const signOutAdminFn = createServerFn({ method: 'POST' }).handler(async () => {
  try {
    await adminAuth.api.signOut({ headers: getRequestHeaders() })
    return { error: null }
  } catch (error) {
    return { error: serializeAuthError(error) }
  }
})
