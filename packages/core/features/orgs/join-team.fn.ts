import { createHash } from 'node:crypto'
import { createServerFn } from '@tanstack/react-start'
import { db } from '@valguide/core/features/db'
import { setActiveTeamId } from '@valguide/features/utils/cookies.ts'
import { z } from 'zod'
import { ForbiddenError, NotFoundError } from '../auth/authorization'
import { requireAuthMiddleware } from '../auth/middleware'
import { acceptInvitation, type JoinTeamResult } from './join-team.server'

export type { JoinTeamResult } from './join-team.server'

import { getInvitationByTokenHash, isTeamMember } from './utils'

const joinTeamSchema = z.object({
  token: z.string(),
})

export const joinTeamFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(joinTeamSchema)
  .handler(async ({ context, data }): Promise<JoinTeamResult> => {
    const tokenHash = createHash('sha256').update(data.token).digest('hex')
    const invite = await getInvitationByTokenHash(db, tokenHash)

    if (!invite) {
      throw new NotFoundError('Invitation')
    }

    const isMember = await isTeamMember(db, invite.organizationId, context.user.id)
    if (isMember) {
      return { success: true }
    }

    if (invite.email.toLowerCase() !== (context.user.email || '').toLowerCase()) {
      throw new ForbiddenError(`This invitation is for ${invite.email}, but you are signed in as ${context.user.email}`)
    }

    await acceptInvitation(db, invite.id, context.user.id)
    setActiveTeamId(invite.organizationId)
    return { success: true }
  })
