import { getRequestHeaders } from '@tanstack/react-start/server'
import { sendEmail } from '@valguide/email'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { emailOTP, organization as organizationPlugin } from 'better-auth/plugins'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { serverEnv } from '../../env/server'
import { db } from '../db'
import { invitation, member, organization } from '../orgs/schema'
import { orgAc, orgRoles } from './organization-permissions'
import { authAccounts, authSessions, authUsers, authVerifications } from './schema'

const cookieSecure = serverEnv.NODE_ENV === 'production'
const sharedTrustedOrigins = serverEnv.BETTER_AUTH_TRUSTED_ORIGINS.split(',').map((origin) => origin.trim())

const regularTrustedOrigins = [serverEnv.APP_BASE_URL, serverEnv.VITE_STUDIO_URL, ...sharedTrustedOrigins].filter(
  (origin, index, all) => !!origin && all.indexOf(origin) === index,
)

const regularCookieDomain = serverEnv.BETTER_AUTH_COOKIE_DOMAIN || undefined

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
  }) => Promise<void>
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
              ...(serverEnv.BETTER_AUTH_DEV_OTP
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
  errorURL: '/auth/error',
  enableEmailOtp: true,
  enableOrganizationPlugin: true,
  sendInvitationEmail: async ({ email, organizationName, inviterEmail, invitationId }) => {
    await sendEmail({
      to: email,
      subject: `Join ${organizationName} on ValGuide`,
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
