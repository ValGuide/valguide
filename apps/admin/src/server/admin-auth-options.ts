export const adminAuthModes = ['slack', 'credentials', 'both'] as const

export type AdminAuthMode = (typeof adminAuthModes)[number]

export type AdminAuthOptionsInput = {
  ADMIN_AUTH_MODE?: string
  SLACK_CLIENT_ID?: string
  SLACK_CLIENT_SECRET?: string
}

export type AdminAuthOptions = {
  mode: AdminAuthMode
  slackConfigured: boolean
  slackEnabled: boolean
  credentialsEnabled: boolean
  configurationError: string | null
}

function isAdminAuthMode(value: string): value is AdminAuthMode {
  return (adminAuthModes as readonly string[]).includes(value)
}

function hasValue(value: string | undefined): boolean {
  return !!value?.trim()
}

export function resolveAdminAuthOptions(input: AdminAuthOptionsInput): AdminAuthOptions {
  const requestedMode = input.ADMIN_AUTH_MODE?.trim()
  const slackConfigured = hasValue(input.SLACK_CLIENT_ID) && hasValue(input.SLACK_CLIENT_SECRET)

  if (requestedMode && !isAdminAuthMode(requestedMode)) {
    return {
      mode: 'credentials',
      slackConfigured,
      slackEnabled: false,
      credentialsEnabled: false,
      configurationError: `ADMIN_AUTH_MODE must be one of: ${adminAuthModes.join(', ')}`,
    }
  }

  const mode: AdminAuthMode =
    requestedMode && isAdminAuthMode(requestedMode) ? requestedMode : slackConfigured ? 'slack' : 'credentials'
  const wantsSlack = mode === 'slack' || mode === 'both'
  const wantsCredentials = mode === 'credentials' || mode === 'both'

  if (wantsSlack && !slackConfigured) {
    return {
      mode,
      slackConfigured,
      slackEnabled: false,
      credentialsEnabled: false,
      configurationError: 'Slack admin auth requires both SLACK_CLIENT_ID and SLACK_CLIENT_SECRET.',
    }
  }

  return {
    mode,
    slackConfigured,
    slackEnabled: wantsSlack,
    credentialsEnabled: wantsCredentials,
    configurationError: null,
  }
}
