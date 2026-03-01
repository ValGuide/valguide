import { getRequestHeaders } from '@tanstack/react-start/server'
import { sendEmail } from '@valguide/email'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { emailOTP } from 'better-auth/plugins'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { serverEnv } from '../../env/server'
import { db } from '../db'
import { authAccounts, authSessions, authUsers, authVerifications } from './schema'

const cookieSecure = serverEnv.NODE_ENV === 'production'
const sharedTrustedOrigins = serverEnv.BETTER_AUTH_TRUSTED_ORIGINS.split(',').map((origin) => origin.trim())

const regularTrustedOrigins = [serverEnv.APP_BASE_URL, serverEnv.VITE_STUDIO_URL, ...sharedTrustedOrigins].filter(
  (origin, index, all) => !!origin && all.indexOf(origin) === index,
)

const adminTrustedOrigins = [serverEnv.ADMIN_BASE_URL, ...sharedTrustedOrigins].filter(
  (origin, index, all) => !!origin && all.indexOf(origin) === index,
)

const regularCookieDomain = serverEnv.BETTER_AUTH_COOKIE_DOMAIN || undefined
const adminCookieDomain = serverEnv.ADMIN_COOKIE_DOMAIN || undefined

const slackSocialProviders =
  serverEnv.SLACK_CLIENT_ID && serverEnv.SLACK_CLIENT_SECRET
    ? {
        slack: {
          clientId: serverEnv.SLACK_CLIENT_ID,
          clientSecret: serverEnv.SLACK_CLIENT_SECRET,
        },
      }
    : undefined

function createAuthInstance(options: {
  cookiePrefix: string
  cookieDomain?: string
  trustedOrigins: string[]
  socialProviders?: {
    slack: {
      clientId: string
      clientSecret: string
    }
  }
  enableEmailOtp?: boolean
}) {
  return betterAuth({
    secret: serverEnv.BETTER_AUTH_SECRET,
    ...(serverEnv.BETTER_AUTH_URL ? { baseURL: serverEnv.BETTER_AUTH_URL } : {}),
    trustedOrigins: options.trustedOrigins,
    database: drizzleAdapter(db, {
      provider: 'pg',
      schema: {
        user: authUsers,
        session: authSessions,
        account: authAccounts,
        verification: authVerifications,
      },
    }),
    ...(options.socialProviders ? { socialProviders: options.socialProviders } : {}),
    advanced: {
      cookiePrefix: options.cookiePrefix,
      useSecureCookies: cookieSecure,
      database: {
        generateId: 'uuid',
      },
      defaultCookieAttributes: {
        httpOnly: true,
        secure: cookieSecure,
        sameSite: 'lax',
        ...(options.cookieDomain ? { domain: options.cookieDomain } : {}),
      },
    },
    plugins: [
      ...(options.enableEmailOtp
        ? [
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
          ]
        : []),
      tanstackStartCookies(),
    ],
  })
}

export const auth = createAuthInstance({
  cookiePrefix: serverEnv.BETTER_AUTH_COOKIE_PREFIX,
  cookieDomain: regularCookieDomain,
  trustedOrigins: regularTrustedOrigins,
  enableEmailOtp: true,
})

// Admin auth uses a dedicated cookie namespace + domain and only Slack social login.
export const adminAuth = createAuthInstance({
  cookiePrefix: 'valguide-admin-auth',
  cookieDomain: adminCookieDomain,
  trustedOrigins: adminTrustedOrigins,
  ...(slackSocialProviders ? { socialProviders: slackSocialProviders } : {}),
})

export async function getAuthSession(headers = getRequestHeaders()) {
  try {
    return await auth.api.getSession({ headers })
  } catch {
    return null
  }
}

export async function getAdminAuthSession(headers = getRequestHeaders()) {
  try {
    return await adminAuth.api.getSession({ headers })
  } catch {
    return null
  }
}
