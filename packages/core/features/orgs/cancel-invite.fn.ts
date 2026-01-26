import { createServerFn } from '@tanstack/react-start'
import { db } from '@valguide/core/features/db'
import { z } from 'zod'
import { requireOrgRole } from '../auth/authorization'
import { requireAuthMiddleware } from '../auth/middleware'
import { deleteInvitation } from './cancel-invite.server'

const cancelInviteSchema = z.object({
  inviteId: z.string(),
  teamId: z.string(),
})

export const cancelInviteFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(cancelInviteSchema)
  .handler(async ({ context, data }) => {
    await requireOrgRole(data.teamId, context.user.id, 'admin')

    await deleteInvitation(db, data.inviteId)
  })
