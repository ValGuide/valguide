import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { serializeAuthError } from '@valguide/core/features/auth/utils'
import { adminAuth } from '../admin-auth.server'
import { adminEnv } from '../env'

export const adminSignInWithSlackFn = createServerFn({ method: 'POST' }).handler(async () => {
  try {
    const data = await adminAuth.api.signInSocial({
      body: {
        provider: 'slack',
        callbackURL: `${adminEnv.ADMIN_BASE_URL}/auth/callback`,
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
