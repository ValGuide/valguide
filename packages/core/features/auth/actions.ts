import type {
  AuthError,
  AuthOtpResponse,
  AuthResponse,
  SignInWithPasswordlessCredentials,
  SignOut,
  VerifyOtpParams,
} from '@supabase/supabase-js'
import { createServerFn } from '@tanstack/react-start'
import { createLogger } from '@valguide/logger'
import { userStartedLoginMessage } from '@valguide/slack/messages/user-started-login.message'
import { postMessage } from '@valguide/slack/send-slack-message'
import { createClient } from '@valguide/supabase/server'
import { waitUntil } from '@vercel/functions'
import { z } from 'zod'

const _log = createLogger('auth-actions')

export type SignInWithOtpAction = (credentials: SignInWithPasswordlessCredentials) => Promise<AuthOtpResponse>
export type VerifyOtpAction = (params: VerifyOtpParams) => Promise<AuthResponse>
export type SignOutAction = (options: SignOut) => Promise<{ error: AuthError | null }>

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

export const signInWithOtpFn = createServerFn({ method: 'POST' })
  .inputValidator(signInWithOtpSchema)
  .handler(async ({ data: credentials }) => {
    const supabase = await createClient()
    const response = await supabase.auth.signInWithOtp(credentials as SignInWithPasswordlessCredentials)
    if (!response.error) {
      const email = 'email' in credentials ? credentials.email : undefined
      waitUntil(postMessage(userStartedLoginMessage({ email })))
    }
    return response
  })

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

export const verifyOtpFn = createServerFn({ method: 'POST' })
  .inputValidator(verifyOtpSchema)
  .handler(async ({ data: params }) => {
    const supabase = await createClient()
    return supabase.auth.verifyOtp(params as VerifyOtpParams)
  })

const signOutSchema = z.object({
  scope: z.enum(['global', 'local', 'others']).optional(),
})

export const signOutFn = createServerFn({ method: 'POST' })
  .inputValidator(signOutSchema)
  .handler(async ({ data: options }) => {
    const supabase = await createClient()
    return supabase.auth.signOut(options as SignOut)
  })
