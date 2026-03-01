import { getRequestHeaders } from '@tanstack/react-start/server'
import { sendEmail } from '@valguide/email'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { emailOTP } from 'better-auth/plugins'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { serverEnv } from '../../env/server'
import { db } from '../db'
import { authAccounts, authSessions, authUsers, authVerifications } from './schema'

const cookieDomain = serverEnv.BETTER_AUTH_COOKIE_DOMAIN || undefined
const cookieSecure = serverEnv.NODE_ENV === 'production'
const trustedOrigins = [
  serverEnv.APP_BASE_URL,
  serverEnv.VITE_STUDIO_URL,
  serverEnv.ADMIN_BASE_URL,
  ...serverEnv.BETTER_AUTH_TRUSTED_ORIGINS.split(',').map((origin) => origin.trim()),
].filter((origin, index, all) => !!origin && all.indexOf(origin) === index)

const socialProviders =
  serverEnv.SLACK_CLIENT_ID && serverEnv.SLACK_CLIENT_SECRET
    ? {
        slack: {
          clientId: serverEnv.SLACK_CLIENT_ID,
          clientSecret: serverEnv.SLACK_CLIENT_SECRET,
        },
      }
    : undefined

export const auth = betterAuth({
  secret: serverEnv.BETTER_AUTH_SECRET,
  ...(serverEnv.BETTER_AUTH_URL ? { baseURL: serverEnv.BETTER_AUTH_URL } : {}),
  trustedOrigins,
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: authUsers,
      session: authSessions,
      account: authAccounts,
      verification: authVerifications,
    },
  }),
  ...(socialProviders ? { socialProviders } : {}),
  advanced: {
    cookiePrefix: serverEnv.BETTER_AUTH_COOKIE_PREFIX,
    useSecureCookies: cookieSecure,
    database: {
      generateId: 'uuid',
    },
    defaultCookieAttributes: {
      httpOnly: true,
      secure: cookieSecure,
      sameSite: 'lax',
      ...(cookieDomain ? { domain: cookieDomain } : {}),
    },
  },
  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: 5 * 60,
      allowedAttempts: 5,
      ...(serverEnv.NODE_ENV === 'development'
        ? {
            generateOTP: () => serverEnv.BETTER_AUTH_DEV_OTP,
          }
        : {}),
      async sendVerificationOTP({ email, otp }) {
        await sendEmail({
          to: email,
          subject: 'Your ValGuide login code',
          template: {
            name: 'otp-login',
            data: {
              code: otp,
              maxValidMinutes: 5,
            },
          },
        })
      },
    }),
    tanstackStartCookies(),
  ],
})

export async function getAuthSession(headers = getRequestHeaders()) {
  try {
    return await auth.api.getSession({ headers })
  } catch {
    return null
  }
}
