import { createServerFn } from '@tanstack/react-start'
import { createClient } from '@valguide/supabase/server'
import { requireAuthMiddleware } from '../auth/middleware'
import { deleteAccount } from './delete-account.server'

// =============================================================================
// SERVER FUNCTION
// =============================================================================

export const deleteAccountFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .handler(async ({ context }) => {
    await deleteAccount(context.user.id)

    const supabase = await createClient()
    await supabase.auth.signOut({ scope: 'global' })

    return { success: true }
  })
