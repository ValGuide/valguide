import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { db } from '@valguide/core/features/db'
import { z } from 'zod'
import { ForbiddenError, NotFoundError } from '../auth/authorization'
import { auth, setActiveOrganizationForCurrentSession } from '../auth/better-auth.server'
import { requireAuthMiddleware } from '../auth/middleware'
import { getPendingInvitationById, isTeamMember } from './utils'

export type JoinTeamResult = {
  success: true
}

const joinTeamSchema = z.object({
  invitationId: z.string(),
})

export const joinTeamFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(joinTeamSchema)
  .handler(async ({ context, data }): Promise<JoinTeamResult> => {
    const invite = await getPendingInvitationById(db, data.invitationId)

    if (!invite) {
      throw new NotFoundError('Invitation')
    }

    const isMember = await isTeamMember(db, invite.organizationId, context.user.id)
    if (isMember) {
      return { success: true }
    }

    if (invite.email.toLowerCase() !== (context.user.email || '').toLowerCase()) {
      throw new ForbiddenError('This invitation was sent to a different email address')
    }

    await auth.api.acceptInvitation({
      headers: getRequestHeaders(),
      body: {
        invitationId: invite.id,
      },
    })
    await setActiveOrganizationForCurrentSession(invite.organizationId)
    return { success: true }
  })
