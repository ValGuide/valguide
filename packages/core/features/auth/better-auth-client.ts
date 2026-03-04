import { createAuthClient } from 'better-auth/client'
import { emailOTPClient, organizationClient } from 'better-auth/client/plugins'
import { orgAc, orgRoles } from './organization-permissions'

export const authClient = createAuthClient({
  plugins: [
    emailOTPClient(),
    organizationClient({
      ac: orgAc,
      roles: orgRoles,
    }),
  ],
})
