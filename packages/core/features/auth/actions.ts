'use server'

import { createClient } from '@valguide/supabase/server'
import { createLogger } from '@valguide/logger'
import type {
  AuthError,
  AuthOtpResponse,
  AuthResponse,
  OAuthResponse,
  SignInWithOAuthCredentials,
  SignInWithPasswordlessCredentials,
  SignOut,
  VerifyOtpParams,
} from '@supabase/supabase-js'

const log = createLogger('auth-actions')

export type SignInWithOAuthAction = (credentials: SignInWithOAuthCredentials) => Promise<OAuthResponse>
export type SignInWithOtpAction = (credentials: SignInWithPasswordlessCredentials) => Promise<AuthOtpResponse>
export type VerifyOtpAction = (params: VerifyOtpParams) => Promise<AuthResponse>
export type SignOutAction = (options: SignOut) => Promise<{ error: AuthError | null }>

export const signInWithOAuthAction: SignInWithOAuthAction = async (credentials) => {
  const supabase = await createClient()
  return supabase.auth.signInWithOAuth(credentials)
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
