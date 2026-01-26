import type { VerifyOtpParams } from '@supabase/supabase-js'
import { createServerFn } from '@tanstack/react-start'
import { createClient } from '@valguide/supabase/server'
import { z } from 'zod'
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
    const supabase = await createClient()
    const response = await supabase.auth.verifyOtp(params as VerifyOtpParams)

    if (response.error) {
      return { data: response.data, error: serializeAuthError(response.error) }
    }

    return { data: response.data, error: null }
  })
