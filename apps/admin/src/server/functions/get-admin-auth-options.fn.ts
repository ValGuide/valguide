import { createServerFn } from '@tanstack/react-start'
import { adminAuthOptions } from '../admin-auth.server'

export const getAdminAuthOptionsFn = createServerFn({ method: 'GET' }).handler(async () => ({
  mode: adminAuthOptions.mode,
  slackEnabled: adminAuthOptions.slackEnabled,
  credentialsEnabled: adminAuthOptions.credentialsEnabled,
  configurationError: adminAuthOptions.configurationError,
}))
