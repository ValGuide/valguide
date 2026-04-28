import { resolveAdminAuthOptions } from './admin-auth-options'

describe('resolveAdminAuthOptions', () => {
  it('keeps hosted Slack defaults when Slack credentials are configured', () => {
    expect(
      resolveAdminAuthOptions({
        SLACK_CLIENT_ID: 'client-id',
        SLACK_CLIENT_SECRET: 'client-secret',
      }),
    ).toMatchObject({
      mode: 'slack',
      slackEnabled: true,
      credentialsEnabled: false,
      configurationError: null,
    })
  })

  it('defaults to credentials when Slack is not configured', () => {
    expect(resolveAdminAuthOptions({})).toMatchObject({
      mode: 'credentials',
      slackEnabled: false,
      credentialsEnabled: true,
      configurationError: null,
    })
  })

  it('allows explicit credentials mode without Slack', () => {
    expect(resolveAdminAuthOptions({ ADMIN_AUTH_MODE: 'credentials' })).toMatchObject({
      mode: 'credentials',
      credentialsEnabled: true,
      configurationError: null,
    })
  })

  it('enables both providers when both mode and Slack credentials are configured', () => {
    expect(
      resolveAdminAuthOptions({
        ADMIN_AUTH_MODE: 'both',
        SLACK_CLIENT_ID: 'client-id',
        SLACK_CLIENT_SECRET: 'client-secret',
      }),
    ).toMatchObject({
      mode: 'both',
      slackEnabled: true,
      credentialsEnabled: true,
      configurationError: null,
    })
  })

  it('fails clearly when Slack mode is requested without full Slack config', () => {
    expect(resolveAdminAuthOptions({ ADMIN_AUTH_MODE: 'slack' })).toMatchObject({
      mode: 'slack',
      slackEnabled: false,
      credentialsEnabled: false,
      configurationError: 'Slack admin auth requires both SLACK_CLIENT_ID and SLACK_CLIENT_SECRET.',
    })
  })

  it('fails clearly for invalid modes', () => {
    expect(resolveAdminAuthOptions({ ADMIN_AUTH_MODE: 'github' })).toMatchObject({
      slackEnabled: false,
      credentialsEnabled: false,
      configurationError: 'ADMIN_AUTH_MODE must be one of: slack, credentials, both',
    })
  })
})
