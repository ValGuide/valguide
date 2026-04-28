import { getRequestHeaders } from '@tanstack/react-start/server'
import { createAuthInstance } from '@valguide/core/features/auth/better-auth.server'
import { resolveAdminAuthOptions } from './admin-auth-options'
import { adminEnv } from './env'

const sharedTrustedOrigins = adminEnv.BETTER_AUTH_TRUSTED_ORIGINS.split(',').map((origin) => origin.trim())

const adminTrustedOrigins = [adminEnv.ADMIN_BASE_URL, ...sharedTrustedOrigins].filter(
  (origin, index, all) => !!origin && all.indexOf(origin) === index,
)

const adminCookieDomain = adminEnv.ADMIN_COOKIE_DOMAIN || undefined
export const adminAuthOptions = resolveAdminAuthOptions(adminEnv)

const slackSocialProviders = adminAuthOptions.slackEnabled
  ? {
      slack: {
        clientId: adminEnv.SLACK_CLIENT_ID,
        clientSecret: adminEnv.SLACK_CLIENT_SECRET,
        getUserInfo: async (token: { accessToken?: string }) => {
          if (!token.accessToken) return null

          const response = await fetch('https://slack.com/api/openid.connect.userInfo', {
            headers: { authorization: `Bearer ${token.accessToken}` },
          })
          const profile = (await response.json()) as Record<string, unknown>
          if (!profile.ok) return null

          if (adminEnv.SLACK_TEAM_ID) {
            const teamId = profile['https://slack.com/team_id']
            if (teamId !== adminEnv.SLACK_TEAM_ID) {
              return null
            }
          }

          return {
            user: {
              id: String(profile['https://slack.com/user_id']),
              name: String(profile.name ?? ''),
              email: String(profile.email ?? ''),
              emailVerified: Boolean(profile.email_verified),
              image: String(profile.picture ?? profile['https://slack.com/user_image_512'] ?? ''),
            },
            data: profile,
          }
        },
      },
    }
  : undefined

export const adminAuth = createAuthInstance({
  baseURL: adminEnv.ADMIN_BASE_URL,
  cookiePrefix: 'valguide-admin-auth',
  cookieDomain: adminCookieDomain,
  trustedOrigins: adminTrustedOrigins,
  sessionCookieCache: {
    enabled: false,
  },
  errorURL: '/auth/error',
  ...(slackSocialProviders ? { socialProviders: slackSocialProviders } : {}),
  ...(adminAuthOptions.credentialsEnabled
    ? {
        emailAndPassword: {
          enabled: true,
          disableSignUp: true,
          minPasswordLength: 12,
        },
      }
    : {}),
})

export async function getAdminAuthSession(headers = getRequestHeaders()) {
  try {
    return await adminAuth.api.getSession({ headers })
  } catch {
    return null
  }
}
