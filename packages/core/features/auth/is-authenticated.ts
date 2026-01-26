import { createServerFn } from '@tanstack/react-start'
import { createClient } from '@valguide/supabase/server'

// ============================================================================
// SERVER FUNCTION
// ============================================================================

/**
 * Check if the current user is authenticated.
 * Uses getClaims() for efficiency (no network call to Supabase).
 */
export const isAuthenticatedFn = createServerFn({ method: 'GET' }).handler(async (): Promise<boolean> => {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  return !!data?.claims?.sub
})
