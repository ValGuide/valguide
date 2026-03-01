import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { serverEnv } from '@valguide/core/env/server'
import { adminAuth } from '@valguide/core/features/auth/better-auth.server'
import { serializeAuthError } from '@valguide/core/features/auth/utils'

export const adminSignInWithSlackFn = createServerFn({ method: 'POST' }).handler(async () => {
  try {
    const data = await adminAuth.api.signInSocial({
      body: {
        provider: 'slack',
        callbackURL: `${serverEnv.ADMIN_BASE_URL}/auth/callback`,
      },
      headers: getRequestHeaders(),
    })

    return { data, error: null }
  } catch (error) {
    return {
      data: null,
      error: serializeAuthError(error),
    }
  }
})
