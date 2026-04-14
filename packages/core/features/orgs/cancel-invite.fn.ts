import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { z } from 'zod'
import { captureStudioProductEvent } from '../../posthog/server'
import { requireOrgRole } from '../auth/authorization'
import { auth } from '../auth/better-auth.server'
import { requireAuthMiddleware } from '../auth/middleware'

const cancelInviteSchema = z.object({
  inviteId: z.string(),
  teamId: z.string(),
})

export const cancelInviteFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(cancelInviteSchema)
  .handler(async ({ context, data }) => {
    await requireOrgRole(data.teamId, context.user.id, 'admin')

    await auth.api.cancelInvitation({
      headers: getRequestHeaders(),
      body: {
        invitationId: data.inviteId,
      },
    })

    await captureStudioProductEvent({
      distinctId: context.user.id,
      event: 'org.invite_canceled',
      properties: {
        organization_id: data.teamId,
        invite_id: data.inviteId,
      },
    })
  })
