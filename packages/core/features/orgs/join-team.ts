import { createHash } from 'node:crypto'
import { createServerFn } from '@tanstack/react-start'
import { type DB, db } from '@valguide/core/features/db'
import { setActiveTeamId } from '@valguide/features/utils/cookies.ts'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { ForbiddenError, NotFoundError } from '../auth/authorization'
import { requireAuthMiddleware } from '../auth/middleware'
import { organizationInvitation, organizationMember } from './schema'
import { getInvitationByTokenHash, isTeamMember } from './utils'

// =============================================================================
// TYPES
// =============================================================================

export type JoinTeamResult = {
  success: true
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

/**
 * Accept an invitation and add user to team
 */
export async function acceptInvitation(dbClient: DB, invitationId: string, userId: string) {
  return await dbClient.transaction(async (tx: DB) => {
    const invite = await tx.query.organizationInvitation.findFirst({
      where: eq(organizationInvitation.id, invitationId),
    })

    if (!invite) throw new Error('Invitation not found')

    // Add member
    await tx.insert(organizationMember).values({
      organizationId: invite.organizationId,
      userId,
      role: invite.role,
    })

    // Mark invitation as accepted
    await tx
      .update(organizationInvitation)
      .set({
        acceptedAt: new Date(),
      })
      .where(eq(organizationInvitation.id, invitationId))
  })
}

// =============================================================================
// SERVER FUNCTION
// =============================================================================

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
