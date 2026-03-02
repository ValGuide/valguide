import { createServerFn } from '@tanstack/react-start'
import { getAuthSession } from './better-auth.server'

// ============================================================================
// SERVER FUNCTION
// ============================================================================

/**
 * Check if the current user is authenticated.
 * Uses getAuthSession() for efficiency.
 */
export const isAuthenticatedFn = createServerFn({ method: 'GET' }).handler(async (): Promise<boolean> => {
  const session = await getAuthSession()
  return !!session?.user?.id
})
