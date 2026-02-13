import { createServerFn } from '@tanstack/react-start'
import { serverEnv } from '@valguide/core/env/server'
import { createAdminClient } from '../supabase'

export const adminSignInWithSlackFn = createServerFn({ method: 'POST' })
  .handler(async () => {
    const supabase = await createAdminClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'slack_oidc',
      options: {
        redirectTo: `${serverEnv.ADMIN_BASE_URL}/auth/callback`,
      },
    })

    if (error) {
      return {
        data: null,
        error: { message: error.message, status: error.status },
      }
    }

    return { data, error: null }
  })
