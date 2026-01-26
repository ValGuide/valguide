import type { SignOut } from '@supabase/supabase-js'
import { createServerFn } from '@tanstack/react-start'
import { createClient } from '@valguide/supabase/server'
import { z } from 'zod'
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
    const supabase = await createClient()
    const response = await supabase.auth.signOut(options as SignOut)

    if (response.error) {
      return { error: serializeAuthError(response.error) }
    }

    return { error: null }
  })
