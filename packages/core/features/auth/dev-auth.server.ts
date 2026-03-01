import { getRequestHeaders } from '@tanstack/react-start/server'
import { serverEnv } from '../../env/server'
import { auth } from './better-auth.server'

const DEV_TEST_EMAIL = 'e2e@valguide.test'

export type DevAuthResult = {
  magicLink: string
  email: string
}

export async function generateDevMagicLink(email = DEV_TEST_EMAIL): Promise<DevAuthResult> {
  if (serverEnv.NODE_ENV !== 'development') {
    throw new Error('Dev auth is only available in development mode')
  }

  await auth.api.sendVerificationOTP({
    body: {
      email,
      type: 'sign-in',
    },
    headers: getRequestHeaders(),
  })

  return {
    magicLink: `${serverEnv.VITE_STUDIO_URL}/login?email=${encodeURIComponent(email)}&otp=${serverEnv.BETTER_AUTH_DEV_OTP}`,
    email,
  }
}
