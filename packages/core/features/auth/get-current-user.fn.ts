import { createServerFn } from '@tanstack/react-start'
import { getAuthSession } from './better-auth.server'

// ============================================================================
// TYPES
// ============================================================================

export type AuthUser = {
  id: string
  email: string | undefined
}

// ============================================================================
// SERVER FUNCTION
// ============================================================================

/**
 * Get the currently authenticated user.
 * Returns null if not authenticated.
 */
export const getCurrentUserFn = createServerFn({ method: 'GET' }).handler(async (): Promise<AuthUser | null> => {
  const session = await getAuthSession()

  if (!session?.user) {
    return null
  }

  return {
    id: session.user.id,
    email: session.user.email,
  }
})
