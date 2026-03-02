import { getRequestHeaders } from '@tanstack/react-start/server'
import { serverEnv } from '@valguide/core/env/server'
import { createAuthInstance } from '@valguide/core/features/auth/better-auth.server'

const sharedTrustedOrigins = serverEnv.BETTER_AUTH_TRUSTED_ORIGINS.split(',').map((origin) => origin.trim())

const adminTrustedOrigins = [serverEnv.ADMIN_BASE_URL, ...sharedTrustedOrigins].filter(
  (origin, index, all) => !!origin && all.indexOf(origin) === index,
)

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

export const adminAuth = createAuthInstance({
  cookiePrefix: 'valguide-admin-auth',
  cookieDomain: adminCookieDomain,
  trustedOrigins: adminTrustedOrigins,
  ...(slackSocialProviders ? { socialProviders: slackSocialProviders } : {}),
})

export async function getAdminAuthSession(headers = getRequestHeaders()) {
  try {
    return await adminAuth.api.getSession({ headers })
  } catch {
    return null
  }
}
