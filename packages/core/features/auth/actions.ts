'use server'

import type {
  AuthError,
  AuthOtpResponse,
  AuthResponse,
  SignInWithPasswordlessCredentials,
  SignOut,
  VerifyOtpParams,
} from '@supabase/supabase-js'
import { createLogger } from '@valguide/logger'
import { userStartedLoginMessage } from '@valguide/slack/messages/user-started-login.message'
import { postMessage } from '@valguide/slack/send-slack-message'
import { createClient } from '@valguide/supabase/server'
import { waitUntil } from '@vercel/functions'

const _log = createLogger('auth-actions')

export type SignInWithOtpAction = (credentials: SignInWithPasswordlessCredentials) => Promise<AuthOtpResponse>
export type VerifyOtpAction = (params: VerifyOtpParams) => Promise<AuthResponse>
export type SignOutAction = (options: SignOut) => Promise<{ error: AuthError | null }>

export const signInWithOtpAction: SignInWithOtpAction = async (credentials) => {
  const supabase = await createClient()
  const response = await supabase.auth.signInWithOtp(credentials)
  if (!response.error) {
    const email = 'email' in credentials ? credentials.email : undefined
    waitUntil(postMessage(userStartedLoginMessage({ email })))
  }
  return response
}

export const verifyOtpAction: VerifyOtpAction = async (params) => {
  const supabase = await createClient()
  return supabase.auth.verifyOtp(params)
}

export const signOutAction: SignOutAction = async (scope = { scope: 'global' }) => {
  const supabase = await createClient()
  return supabase.auth.signOut(scope)
}
