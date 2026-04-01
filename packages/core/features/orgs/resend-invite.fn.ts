import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { db } from '@valguide/core/features/db'
import { z } from 'zod'
import { captureStudioProductEvent } from '../../posthog/server'
import { NotFoundError, requireOrgRole } from '../auth/authorization'
import { auth } from '../auth/better-auth.server'
import { requireAuthMiddleware } from '../auth/middleware'
import { isOrgRole } from './schema'
import { getInvitationById } from './utils'

// =============================================================================
// SERVER FUNCTION
// =============================================================================

const resendInviteSchema = z.object({
  inviteId: z.string(),
  teamId: z.string(),
})

export const resendInviteFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(resendInviteSchema)
  .handler(async ({ context, data }) => {
    await requireOrgRole(data.teamId, context.user.id, 'admin')

    const invite = await getInvitationById(db, data.inviteId)
    if (!invite) throw new NotFoundError('Invitation')

    if (!isOrgRole(invite.role)) {
      throw new NotFoundError('Invitation')
    }

    await auth.api.createInvitation({
      headers: getRequestHeaders(),
      body: {
        organizationId: data.teamId,
        email: invite.email,
        role: invite.role,
        resend: true,
      },
    })

    await captureStudioProductEvent({
      distinctId: context.user.id,
      event: 'org.invite_sent',
      organizationNanoId: invite.organization.nanoId,
      properties: {
        role: invite.role,
        resend: true,
      },
    })
  })
