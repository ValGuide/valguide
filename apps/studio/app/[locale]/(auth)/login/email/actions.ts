'use server'

import { z } from 'zod'
import { createLogger } from '@valguide/logger'
import { signIn } from '@/app/[locale]/(auth)/auth'

const log = createLogger('login-email-actions')

export const signInWithEmailAction = z
  .function()
  .args(z.object({ email: z.string() }))
  .implement(async ({ email }) => {
    log.info('Signing in with email', email)
    return signIn('email-otp', { email, redirect: false })
  })
