import { createServerFn } from '@tanstack/react-start'
import { db } from '@valguide/core/features/db'
import { z } from 'zod'
import { requireOrgRole } from '../auth/authorization'
import { requireAuthMiddleware } from '../auth/middleware'
import { getPendingInvitations } from './get-pending-invitations.server'

const getPendingInvitationsSchema = z.object({
  teamId: z.string(),
})

export const getPendingInvitationsFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getPendingInvitationsSchema)
  .handler(async ({ context, data }) => {
    // Only admins and above can see pending invitations
    await requireOrgRole(data.teamId, context.user.id, 'admin')
    return getPendingInvitations(db, data.teamId)
  })
