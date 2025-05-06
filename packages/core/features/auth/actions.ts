'use server'

import { createClient } from '@valguide/supabase/server'
import { createLogger } from '@valguide/logger'
import type {
  AuthOtpResponse,
  AuthResponse,
  OAuthResponse,
  SignInWithOAuthCredentials,
  SignInWithPasswordlessCredentials,
  SignOut,
  VerifyOtpParams,
} from '@supabase/supabase-js'
import { AuthError } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'

const log = createLogger('auth-actions')

export type SignInWithOAuthAction = (credentials: SignInWithOAuthCredentials) => Promise<OAuthResponse>
export type SignInWithOtpAction = (credentials: SignInWithPasswordlessCredentials) => Promise<AuthOtpResponse>
export type VerifyOtpAction = (params: VerifyOtpParams) => Promise<AuthResponse>
export type SignOutAction = (options: SignOut) => Promise<{ error: AuthError | null }>

export const signInWithOAuthAction: SignInWithOAuthAction = async (credentials) => {
  const supabase = await createClient()
  console.info(`Signing in with ${credentials.provider}`, credentials)
  const response = await supabase.auth.signInWithOAuth(credentials)
  console.info('Response', response)
  if (response.data.url) {
    redirect(response.data.url)
  }
  if (response.error) {
    throw response.error
  }

  throw new AuthError('Unknown error', 500, '500')
}

export const signInWithOtpAction: SignInWithOtpAction = async (credentials) => {
  const supabase = await createClient()
  return supabase.auth.signInWithOtp(credentials)
}

export const verifyOtpAction: VerifyOtpAction = async (params) => {
  const supabase = await createClient()
  return supabase.auth.verifyOtp(params)
}

export const signOutAction: SignOutAction = async (scope = { scope: 'global' }) => {
  const supabase = await createClient()
  return supabase.auth.signOut(scope)
}
