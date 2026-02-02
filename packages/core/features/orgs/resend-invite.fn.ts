import { createHash, randomBytes } from 'node:crypto'
import { createServerFn } from '@tanstack/react-start'
import { db } from '@valguide/core/features/db'
import { sendEmail } from '@valguide/email'
import { z } from 'zod'
import { serverEnv } from '../../env/server'
import { NotFoundError, requireOrgRole } from '../auth/authorization'
import { requireAuthMiddleware } from '../auth/middleware'
import { getTeamById } from './get-team.server'
import { createInvitation } from './invite-member.server'
import type { OrgRole } from './schema'
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

    const team = await getTeamById(db, data.teamId)
    if (!team) throw new NotFoundError('Team')

    const token = randomBytes(32).toString('hex')
    const tokenHash = createHash('sha256').update(token).digest('hex')

    await createInvitation(db, data.teamId, invite.email, invite.role as OrgRole, context.user.id, tokenHash)

    await sendEmail({
      to: invite.email,
      subject: `Join ${team.name} on ValGuide`,
      template: {
        name: 'team-invite',
        data: {
          inviteLink: `${serverEnv.VITE_STUDIO_URL}/join-team?token=${token}`,
          teamName: team.name,
          inviterName: context.user.email || 'A colleague',
          logoUrl: `${serverEnv.VITE_STUDIO_URL}/icon.png`,
        },
      },
    })

    console.log(`Resend invite link for ${invite.email}: /join-team?token=${token}`)
  })
