import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { z } from 'zod'
import { captureStudioProductEvent } from '../../posthog/server'
import { requireOrgRole } from '../auth/authorization'
import { auth } from '../auth/better-auth.server'
import { requireAuthMiddleware } from '../auth/middleware'
import { ORG_ROLES } from './schema'

const updateMemberRoleSchema = z.object({
  memberId: z.string(),
  teamId: z.string(),
  newRole: z.enum(ORG_ROLES),
})

export const updateMemberRoleFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(updateMemberRoleSchema)
  .handler(async ({ context, data }) => {
    await requireOrgRole(data.teamId, context.user.id, 'admin')

    await auth.api.updateMemberRole({
      headers: getRequestHeaders(),
      body: {
        memberId: data.memberId,
        organizationId: data.teamId,
        role: data.newRole,
      },
    })

    captureStudioProductEvent({
      distinctId: context.user.id,
      event: 'org.member_role_updated',
      properties: {
        organization_id: data.teamId,
        member_id: data.memberId,
        new_role: data.newRole,
      },
    })
  })
