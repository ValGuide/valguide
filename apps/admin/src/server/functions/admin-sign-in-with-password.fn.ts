import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { serializeAuthError } from '@valguide/core/features/auth/utils'
import { z } from 'zod'
import { adminAuth, adminAuthOptions } from '../admin-auth.server'
import { isSuperadmin } from '../utils/superadmin'

const adminSignInWithPasswordSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

function authModeError(message: string) {
  return {
    code: 'ADMIN_AUTH_NOT_AVAILABLE',
    status: 400,
    name: 'AdminAuthModeError',
    message,
  }
}

export const adminSignInWithPasswordFn = createServerFn({ method: 'POST' })
  .inputValidator(adminSignInWithPasswordSchema)
  .handler(async ({ data }) => {
    try {
      if (adminAuthOptions.configurationError) {
        return { data: null, error: authModeError(adminAuthOptions.configurationError) }
      }

      if (!adminAuthOptions.credentialsEnabled) {
        return {
          data: null,
          error: authModeError('Email and password admin login is not enabled for this deployment.'),
        }
      }

      if (!isSuperadmin(data.email)) {
        return { data: null, error: authModeError('This email is not allowed to access the admin dashboard.') }
      }

      const result = await adminAuth.api.signInEmail({
        body: {
          email: data.email,
          password: data.password,
          rememberMe: true,
        },
        headers: getRequestHeaders(),
      })

      return {
        data: {
          url: result.url ?? '/users',
          user: result.user,
        },
        error: null,
      }
    } catch (error) {
      return {
        data: null,
        error: serializeAuthError(error),
      }
    }
  })
