import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { z } from 'zod'
import { auth } from './better-auth.server'
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

      return { data, error: null }
    } catch (error) {
      return { data: null, error: serializeAuthError(error) }
    }
  })
