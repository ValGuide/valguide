import type { SignInWithPasswordlessCredentials } from '@supabase/supabase-js'
import { createServerFn } from '@tanstack/react-start'
import { userStartedLoginMessage } from '@valguide/slack/messages/user-started-login.message'
import { postMessage } from '@valguide/slack/send-slack-message'
import { createClient } from '@valguide/supabase/server'
import { waitUntil } from '@vercel/functions'
import { z } from 'zod'
import { serializeAuthError } from '../auth/utils'
import { checkAdminEmailAllowed } from './admin-sign-in-with-otp.server'

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

export const adminSignInWithOtpFn = createServerFn({ method: 'POST' })
  .inputValidator(signInWithOtpSchema)
  .handler(async ({ data: credentials }) => {
    const email = 'email' in credentials ? credentials.email : undefined
    if (!email) {
      return {
        data: { user: null, session: null },
        error: { message: 'Email is required', status: 400 },
      }
    }

    try {
      checkAdminEmailAllowed(email)
    } catch {
      return {
        data: { user: null, session: null },
        error: { message: 'Email not authorized for admin access', status: 403 },
      }
    }

    const supabase = await createClient()
    const response = await supabase.auth.signInWithOtp(credentials as SignInWithPasswordlessCredentials)

    if (!response.error) {
      waitUntil(postMessage(userStartedLoginMessage({ email })))
      return { data: response.data, error: null }
    }

    return { data: response.data, error: serializeAuthError(response.error) }
  })
