import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '../db'
import { auth } from './better-auth.server'
import { getUserStatus } from './get-user-status.server'
import { authSessions } from './schema'
import { serializeAuthError } from './utils'

// ============================================================================
// SCHEMA
// ============================================================================

const verifyOtpSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
  token: z.string(),
  type: z.enum(['sms', 'phone_change', 'signup', 'invite', 'magiclink', 'recovery', 'email_change', 'email']),
  options: z
    .object({
      redirectTo: z.string().optional(),
      captchaToken: z.string().optional(),
    })
    .optional(),
})

// ============================================================================
// SERVER FUNCTION
// ============================================================================

/**
 * Verify a one-time password (OTP) code.
 * Completes the authentication flow started by signInWithOtpFn.
 */
export const verifyOtpFn = createServerFn({ method: 'POST' })
  .inputValidator(verifyOtpSchema)
  .handler(async ({ data: params }) => {
    if (!params.email) {
      return {
        data: null,
        error: serializeAuthError({
          message: 'Email is required',
          status: 400,
          code: 'EMAIL_REQUIRED',
        }),
      }
    }

    try {
      const data = await auth.api.signInEmailOTP({
        body: {
          email: params.email,
          otp: params.token,
        },
        headers: getRequestHeaders(),
      })

      const userId = data?.user?.id
      if (userId) {
        const status = await getUserStatus(userId, data.user.email ?? undefined)

        if (status === 'blocked') {
          await db.delete(authSessions).where(eq(authSessions.userId, userId))
          await auth.api.signOut({ headers: getRequestHeaders() })

          return {
            data: null,
            error: serializeAuthError({
              message: 'User account is blocked',
              status: 403,
              code: 'USER_BLOCKED',
            }),
          }
        }
      }

      console.info('[verifyOtpFn] OTP verification successful for email:', params.email)
      return { data, error: null }
    } catch (error) {
      return { data: null, error: serializeAuthError(error) }
    }
  })
