import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireAuthMiddleware } from '../auth/middleware'
import { acceptInvitationForUser } from './accept-invitation.server'

export type JoinTeamResult = {
  success: true
  organizationId: string
  organizationName: string
}

const joinTeamSchema = z.object({
  invitationId: z.string(),
  switchToOrganization: z.boolean().optional(),
})

export const joinTeamFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(joinTeamSchema)
  .handler(async ({ context, data }): Promise<JoinTeamResult> => {
    return acceptInvitationForUser({
      invitationId: data.invitationId,
      userId: context.user.id,
      userEmail: context.user.email,
      switchToOrganization: data.switchToOrganization ?? true,
    })
  })
