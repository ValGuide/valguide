import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { userStartedLoginMessage } from '@valguide/slack/messages/user-started-login.message'
import { postMessage } from '@valguide/slack/send-slack-message'
import { z } from 'zod'
import { waitUntil } from '../../utils/wait-until'
import { auth } from './better-auth.server'
import { serializeAuthError } from './utils'

// ============================================================================
// SCHEMA
// ============================================================================

const signInWithOtpSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
  options: z
    .object({
      emailRedirectTo: z.string().optional(),
      shouldCreateUser: z.boolean().optional(),
      data: z.record(z.unknown()).optional(),
      captchaToken: z.string().optional(),
    })
    .optional(),
})

// ============================================================================
// SERVER FUNCTION
// ============================================================================

/**
 * Send a one-time password (OTP) to the user's email or phone.
 * Also sends a Slack notification for login tracking.
 */
export const signInWithOtpFn = createServerFn({ method: 'POST' })
  .inputValidator(signInWithOtpSchema)
  .handler(async ({ data: credentials }) => {
    if (!credentials.email) {
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
      await auth.api.sendVerificationOTP({
        body: {
          email: credentials.email,
          type: 'sign-in',
        },
        headers: getRequestHeaders(),
      })

      waitUntil(postMessage(userStartedLoginMessage({ email: credentials.email })))
      return { data: null, error: null }
    } catch (error) {
      return { data: null, error: serializeAuthError(error) }
    }
  })
