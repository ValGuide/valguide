import type { SignInWithPasswordlessCredentials } from '@supabase/supabase-js'
import { createServerFn } from '@tanstack/react-start'
import { userStartedLoginMessage } from '@valguide/slack/messages/user-started-login.message'
import { postMessage } from '@valguide/slack/send-slack-message'
import { createClient } from '@valguide/supabase/server'
import { waitUntil } from '@vercel/functions'
import { z } from 'zod'
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
    const supabase = await createClient()
    const response = await supabase.auth.signInWithOtp(credentials as SignInWithPasswordlessCredentials)

    if (!response.error) {
      const email = 'email' in credentials ? credentials.email : undefined
      waitUntil(postMessage(userStartedLoginMessage({ email })))
      return { data: response.data, error: null }
    }

    return { data: response.data, error: serializeAuthError(response.error) }
  })
