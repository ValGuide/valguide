import { createServerFn } from '@tanstack/react-start'
import { createClient } from '@valguide/supabase/server'

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
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user) {
    return null
  }

  return {
    id: data.user.id,
    email: data.user.email,
  }
})
