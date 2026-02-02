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

export type { InviteMemberInput } from './invite-member.server'

import { ORG_ROLES, type OrgRole } from './schema'

const inviteMemberSchema = z.object({
  teamId: z.string(),
  email: z.string().email(),
  role: z.enum(ORG_ROLES),
})

export const inviteMemberFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(inviteMemberSchema)
  .handler(async ({ context, data }) => {
    await requireOrgRole(data.teamId, context.user.id, 'admin')

    const team = await getTeamById(db, data.teamId)
    if (!team) throw new NotFoundError('Team')

    const token = randomBytes(32).toString('hex')
    const tokenHash = createHash('sha256').update(token).digest('hex')

    await createInvitation(db, data.teamId, data.email, data.role as OrgRole, context.user.id, tokenHash)

    await sendEmail({
      to: data.email,
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

    console.log(`Invite link for ${data.email}: /join-team?token=${token}`)
  })
