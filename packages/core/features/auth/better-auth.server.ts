import { getRequestHeaders } from '@tanstack/react-start/server'
import { sendEmail } from '@valguide/email'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { createAuthMiddleware } from 'better-auth/api'
import { emailOTP, organization as organizationPlugin } from 'better-auth/plugins'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { serverEnv } from '../../env/server'
import { defaultLocale, type SupportedLocale } from '../../i18n/i18n.config'
import { resolveLocaleFromHeaders } from '../../i18n/locale-resolution'
import { userLoggedInMessage } from '../../slack/messages/user-logged-in.message'
import { userStartedLoginMessage } from '../../slack/messages/user-started-login.message'
import { postMessage } from '../../slack/send-slack-message'
import { db } from '../db'
import { invitation, member, organization } from '../orgs/schema'
import { getUserStatus } from './get-user-status.server'
import { orgAc, orgRoles } from './organization-permissions'
import { authAccounts, authSessions, authUsers, authVerifications } from './schema'

const cookieSecure = serverEnv.NODE_ENV === 'production'
const isProduction = serverEnv.NODE_ENV === 'production'
const sharedTrustedOrigins = serverEnv.BETTER_AUTH_TRUSTED_ORIGINS.split(',').map((origin) => origin.trim())

const regularTrustedOrigins = [serverEnv.APP_BASE_URL, serverEnv.VITE_STUDIO_URL, ...sharedTrustedOrigins].filter(
  (origin, index, all) => !!origin && all.indexOf(origin) === index,
)

const regularCookieDomain = serverEnv.BETTER_AUTH_COOKIE_DOMAIN || undefined
const otpSendLimit = isProduction ? 3 : 4
const otpVerifyLimit = isProduction ? 5 : 6

function normalizeEmail(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null
  }

  const normalized = value.trim().toLowerCase()
  return normalized.length > 0 ? normalized : null
}

function resolveEmailLocaleFromHeaders(headers: Headers | null): SupportedLocale {
  return resolveLocaleFromHeaders(headers)
}

function resolveCurrentRequestEmailLocale(): SupportedLocale {
  try {
    return resolveEmailLocaleFromHeaders(getRequestHeaders())
  } catch {
    return defaultLocale
  }
}

export function createAuthInstance(options: {
  baseURL?: string
  cookiePrefix: string
  cookieDomain?: string
  trustedOrigins: string[]
  socialProviders?: {
    slack: {
      clientId: string
      clientSecret: string
      getUserInfo?: (token: { accessToken?: string; idToken?: string }) => Promise<{
        user: {
          id: string
          name?: string
          email?: string | null
          image?: string
          emailVerified: boolean
          [key: string]: unknown
        }
        data: unknown
      } | null>
    }
  }
  enableEmailOtp?: boolean
  enableOrganizationPlugin?: boolean
  errorURL?: string
  sendInvitationEmail?: (input: {
    email: string
    organizationName: string
    inviterEmail: string
    invitationId: string
    locale: SupportedLocale
  }) => Promise<void>
  sessionCookieCache?:
    | {
        enabled: false
      }
    | {
        enabled: true
        maxAge: number
      }
}) {
  return betterAuth({
    secret: serverEnv.BETTER_AUTH_SECRET,
    ...(options.baseURL || serverEnv.BETTER_AUTH_URL ? { baseURL: options.baseURL || serverEnv.BETTER_AUTH_URL } : {}),
    trustedOrigins: options.trustedOrigins,
    ...(options.errorURL ? { onAPIError: { errorURL: options.errorURL } } : {}),
    database: drizzleAdapter(db, {
      provider: 'pg',
      schema: {
        user: authUsers,
        session: authSessions,
        account: authAccounts,
        verification: authVerifications,
        organization,
        member,
        invitation,
      },
    }),
    ...(options.socialProviders ? { socialProviders: options.socialProviders } : {}),
    ...(options.sessionCookieCache ? { session: { cookieCache: options.sessionCookieCache } } : {}),
    rateLimit: {
      enabled: true,
      window: 60,
      max: isProduction ? 100 : 1000,
      customRules: {
        '/email-otp/send-verification-otp': { window: 60, max: otpSendLimit },
        '/api/auth/email-otp/send-verification-otp': { window: 60, max: otpSendLimit },
        '/sign-in/email-otp': { window: 60, max: otpVerifyLimit },
        '/api/auth/sign-in/email-otp': { window: 60, max: otpVerifyLimit },
        '/email-otp/check-verification-otp': { window: 60, max: otpVerifyLimit },
        '/api/auth/email-otp/check-verification-otp': { window: 60, max: otpVerifyLimit },
      },
    },
    hooks: {
      after: createAuthMiddleware(async (ctx) => {
        if (ctx.path === '/email-otp/send-verification-otp') {
          const result = ctx.context.returned as { success?: boolean } | undefined
          if (!result?.success) {
            return
          }
          const email = normalizeEmail((ctx.body as { email?: unknown } | undefined)?.email)
          if (!email) {
            return
          }
          await ctx.context.runInBackgroundOrAwait(
            postMessage(
              userStartedLoginMessage({
                email,
                timestampMs: Date.now(),
              }),
            ),
          )
        }

        if (ctx.path === '/sign-in/email-otp') {
          const userId = ctx.context.newSession?.user?.id
          const email = normalizeEmail(ctx.context.newSession?.user?.email)
          if (!userId || !email) {
            return
          }
          const status = await getUserStatus(userId, email)
          await ctx.context.runInBackgroundOrAwait(
            postMessage(
              userLoggedInMessage({
                email,
                userId,
                status,
                timestampMs: Date.now(),
              }),
            ),
          )
        }
      }),
    },
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
              rateLimit: {
                window: 60,
                max: otpVerifyLimit,
              },
              ...(serverEnv.BETTER_AUTH_DEV_OTP
                ? {
                    generateOTP: () => serverEnv.BETTER_AUTH_DEV_OTP,
                  }
                : {}),
              async sendVerificationOTP({ email, otp }) {
                await sendEmail({
                  to: email,
                  locale: resolveCurrentRequestEmailLocale(),
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
      ...(options.enableOrganizationPlugin
        ? [
            organizationPlugin({
              ac: orgAc,
              roles: orgRoles,
              invitationExpiresIn: 7 * 24 * 60 * 60,
              cancelPendingInvitationsOnReInvite: true,
              ...(options.sendInvitationEmail
                ? {
                    sendInvitationEmail: async ({ email, organization, inviter, id }) => {
                      await options.sendInvitationEmail?.({
                        email,
                        organizationName: organization.name,
                        inviterEmail: inviter.user.email,
                        invitationId: id,
                        locale: resolveCurrentRequestEmailLocale(),
                      })
                    },
                  }
                : {}),
              schema: {
                session: {
                  fields: {
                    activeOrganizationId: 'activeOrganizationId',
                  },
                },
                organization: {
                  modelName: 'organization',
                  fields: {
                    name: 'name',
                    slug: 'slug',
                    logo: 'logoStoragePath',
                    createdAt: 'createdAt',
                    updatedAt: 'updatedAt',
                  },
                },
                member: {
                  modelName: 'member',
                  fields: {
                    organizationId: 'organizationId',
                    userId: 'userId',
                    role: 'role',
                    createdAt: 'createdAt',
                  },
                },
                invitation: {
                  modelName: 'invitation',
                  fields: {
                    organizationId: 'organizationId',
                    email: 'email',
                    role: 'role',
                    status: 'status',
                    expiresAt: 'expiresAt',
                    createdAt: 'createdAt',
                    inviterId: 'inviterId',
                  },
                },
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
  sessionCookieCache: {
    enabled: true,
    maxAge: 300,
  },
  errorURL: '/auth/error',
  enableEmailOtp: true,
  enableOrganizationPlugin: true,
  sendInvitationEmail: async ({ email, organizationName, inviterEmail, invitationId, locale }) => {
    await sendEmail({
      to: email,
      locale,
      template: {
        name: 'team-invite',
        data: {
          inviteLink: `${serverEnv.VITE_STUDIO_URL}/join-team?invitationId=${invitationId}`,
          teamName: organizationName,
          inviterName: inviterEmail || 'A colleague',
          logoUrl: `${serverEnv.VITE_STUDIO_URL}/icon.png`,
        },
      },
    })
  },
})

export async function setActiveOrganizationForCurrentSession(
  organizationId: string | null,
  headers = getRequestHeaders(),
) {
  await auth.api.setActiveOrganization({
    headers,
    body: {
      organizationId,
    },
  })
}

export async function getAuthSession(headers = getRequestHeaders()) {
  try {
    return await auth.api.getSession({ headers })
  } catch {
    return null
  }
}
