import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { serializeAuthError } from '@valguide/core/features/auth/utils'
import { adminAuth, adminAuthOptions } from '../admin-auth.server'
import { adminEnv } from '../env'

function authModeError(message: string) {
  return {
    code: 'ADMIN_AUTH_NOT_AVAILABLE',
    status: 400,
    name: 'AdminAuthModeError',
    message,
  }
}

export const adminSignInWithSlackFn = createServerFn({ method: 'POST' }).handler(async () => {
  try {
    if (adminAuthOptions.configurationError) {
      return { data: null, error: authModeError(adminAuthOptions.configurationError) }
    }

    if (!adminAuthOptions.slackEnabled) {
      return { data: null, error: authModeError('Slack admin login is not enabled for this deployment.') }
    }

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
