import type { AuthError, SignInWithPasswordlessCredentials, SignOut, VerifyOtpParams } from '@supabase/supabase-js'
import { createServerFn } from '@tanstack/react-start'
import { userStartedLoginMessage } from '@valguide/slack/messages/user-started-login.message'
import { postMessage } from '@valguide/slack/send-slack-message'
import { createClient } from '@valguide/supabase/server'
import { waitUntil } from '@vercel/functions'
import { z } from 'zod'
import { handleError } from '../../utils/server-fn-error-handler'

export type AuthUser = {
  id: string
  email: string | undefined
}

export const getCurrentUserFn = createServerFn({ method: 'GET' }).handler(
  handleError(async (): Promise<AuthUser | null> => {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.getUser()

    if (error || !data.user) {
      return null
    }

    return {
      id: data.user.id,
      email: data.user.email,
    }
  }),
)

export const isAuthenticatedFn = createServerFn({ method: 'GET' }).handler(
  handleError(async (): Promise<boolean> => {
    const supabase = await createClient()
    const { data } = await supabase.auth.getClaims()
    return !!data?.claims?.sub
  }),
)

type SerializableError = {
  code: string | undefined
  status: number | undefined
  name: string
  message: string
}

function serializeAuthError(error: AuthError): SerializableError {
  return {
    code: error.code,
    status: error.status,
    name: error.name,
    message: error.message,
  }
}

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
  .handler(
    handleError(async ({ data: credentials }) => {
      const supabase = await createClient()
      const response = await supabase.auth.signInWithOtp(credentials as SignInWithPasswordlessCredentials)
      if (!response.error) {
        const email = 'email' in credentials ? credentials.email : undefined
        waitUntil(postMessage(userStartedLoginMessage({ email })))
        return { data: response.data, error: null }
      }
      return { data: response.data, error: serializeAuthError(response.error) }
    }),
  )

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
  .handler(
    handleError(async ({ data: params }) => {
      const supabase = await createClient()
      const response = await supabase.auth.verifyOtp(params as VerifyOtpParams)
      if (response.error) {
        return { data: response.data, error: serializeAuthError(response.error) }
      }
      return { data: response.data, error: null }
    }),
  )

const signOutSchema = z.object({
  scope: z.enum(['global', 'local', 'others']).optional(),
})

export const signOutFn = createServerFn({ method: 'POST' })
  .inputValidator(signOutSchema)
  .handler(
    handleError(async ({ data: options }) => {
      const supabase = await createClient()
      const response = await supabase.auth.signOut(options as SignOut)
      if (response.error) {
        return { error: serializeAuthError(response.error) }
      }
      return { error: null }
    }),
  )
