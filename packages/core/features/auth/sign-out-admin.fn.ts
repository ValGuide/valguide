import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { adminAuth } from './better-auth.server'
import { serializeAuthError } from './utils'

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
