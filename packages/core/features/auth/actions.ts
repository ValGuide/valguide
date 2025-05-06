'use server'

import { createClient } from '@valguide/supabase/server'
import type {
  AuthOtpResponse,
  AuthResponse,
  SignInWithPasswordlessCredentials,
  SignOut,
  VerifyOtpParams,
} from '@supabase/supabase-js'
import { AuthError } from '@supabase/supabase-js'

export type SignInWithOtpAction = (credentials: SignInWithPasswordlessCredentials) => Promise<AuthOtpResponse>
export type VerifyOtpAction = (params: VerifyOtpParams) => Promise<AuthResponse>
export type SignOutAction = (options: SignOut) => Promise<{ error: AuthError | null }>

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
