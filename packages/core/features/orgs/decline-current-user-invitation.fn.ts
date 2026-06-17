import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { z } from 'zod'
import { ForbiddenError, NotFoundError } from '../auth/authorization'
import { auth } from '../auth/better-auth.server'
import { requireAuthMiddleware } from '../auth/middleware'
import { db } from '../db'
import { getPendingInvitationById } from './utils'

const declineCurrentUserInvitationSchema = z.object({
  invitationId: z.string(),
})

export const declineCurrentUserInvitationFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(declineCurrentUserInvitationSchema)
  .handler(async ({ context, data }) => {
    const invite = await getPendingInvitationById(db, data.invitationId)

    if (!invite) {
      throw new NotFoundError('Invitation')
    }

    if (invite.email.toLowerCase() !== (context.user.email || '').toLowerCase()) {
      throw new ForbiddenError('This invitation was sent to a different email address')
    }

    await auth.api.rejectInvitation({
      headers: getRequestHeaders(),
      body: {
        invitationId: invite.id,
      },
    })

    return { success: true }
  })
