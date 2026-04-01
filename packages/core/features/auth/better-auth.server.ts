import { getRequestHeaders } from '@tanstack/react-start/server'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { createAuthMiddleware } from 'better-auth/api'
import { betterAuth } from 'better-auth/minimal'
import { emailOTP } from 'better-auth/plugins/email-otp'
import { organization as organizationPlugin } from 'better-auth/plugins/organization'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { serverEnv } from '../../env/server'
import { defaultLocale, type SupportedLocale } from '../../i18n/i18n.config'
import { resolveLocaleFromHeaders } from '../../i18n/locale-resolution'
import { captureStudioProductEvent } from '../../posthog/server'
import { db } from '../db'
import { invitation, member, organization } from '../orgs/schema'
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

function resolveCurrentRequestEmailLocale(): SupportedLocale {
  try {
    return resolveLocaleFromHeaders(getRequestHeaders())
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
  enableOrganizationPlugin?: boolean
  errorURL?: string
  onVerificationOtpSent?: (input: { email: string }) => Promise<void>
  onOtpSignIn?: (input: { email: string; userId: string }) => Promise<void>
  sendInvitationEmail?: (input: {
    email: string
    organizationName: string
    inviterEmail: string
    invitationId: string
  }) => Promise<void>
  sendVerificationOtp?: (input: { email: string; otp: string }) => Promise<void>
  sessionCookieCache?:
    | {
        enabled: false
      }
    | {
        enabled: true
        maxAge: number
      }
}) {
  const authHooks =
    options.onVerificationOtpSent || options.onOtpSignIn
      ? {
          after: createAuthMiddleware(async (ctx) => {
            if (ctx.path === '/email-otp/send-verification-otp' && options.onVerificationOtpSent) {
              const result = ctx.context.returned as { success?: boolean } | undefined
              if (!result?.success) {
                return
              }

              const email = normalizeEmail((ctx.body as { email?: unknown } | undefined)?.email)
              if (!email) {
                return
              }

              await ctx.context.runInBackgroundOrAwait(options.onVerificationOtpSent({ email }))
            }

            if (ctx.path === '/sign-in/email-otp' && options.onOtpSignIn) {
              const userId = ctx.context.newSession?.user?.id
              const email = normalizeEmail(ctx.context.newSession?.user?.email)
              if (!userId || !email) {
                return
              }

              await ctx.context.runInBackgroundOrAwait(options.onOtpSignIn({ email, userId }))
            }
          }),
        }
      : undefined

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
    ...(authHooks ? { hooks: authHooks } : {}),
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
      ...(options.sendVerificationOtp
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
                await options.sendVerificationOtp?.({ email, otp })
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
  enableOrganizationPlugin: true,
  async onVerificationOtpSent({ email }) {
    const [{ userStartedLoginMessage }, { sendSlackMessage }] = await Promise.all([
      import('../../slack/messages/user-started-login.message'),
      import('../../slack/send-slack-message'),
    ])

    await captureStudioProductEvent({
      distinctId: email,
      event: 'auth.otp_requested',
    })

    await sendSlackMessage(
      userStartedLoginMessage({
        email,
        timestampMs: Date.now(),
      }),
    )
  },
  async onOtpSignIn({ email, userId }) {
    const [{ getUserStatus }, { userLoggedInMessage }, { sendSlackMessage }] = await Promise.all([
      import('./get-user-status.server'),
      import('../../slack/messages/user-logged-in.message'),
      import('../../slack/send-slack-message'),
    ])

    const status = await getUserStatus(userId, email)
    await captureStudioProductEvent({
      distinctId: userId,
      event: 'auth.otp_verified',
      properties: {
        approved_status: status,
      },
    })
    await sendSlackMessage(
      userLoggedInMessage({
        email,
        userId,
        status,
        timestampMs: Date.now(),
      }),
    )
  },
  async sendVerificationOtp({ email, otp }) {
    const { sendEmail } = await import('@valguide/email/send-email')

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
  async sendInvitationEmail({ email, organizationName, inviterEmail, invitationId }) {
    const { sendEmail } = await import('@valguide/email/send-email')
    const { notifyMemberInvited } = await import('../orgs/notify-member-invited.server')

    await sendEmail({
      to: email,
      locale: resolveCurrentRequestEmailLocale(),
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

    notifyMemberInvited(invitationId).catch((error) => {
      console.error('Failed to send member invited notification to Slack:', error)
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
