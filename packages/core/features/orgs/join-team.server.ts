import type { DB } from '@valguide/core/features/db'
import { and, eq } from 'drizzle-orm'
import { profiles } from '../profiles/schema'
import { organizationInvitation, organizationMember } from './schema'

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

    await tx.insert(organizationMember).values({
      organizationId: invite.organizationId,
      userId,
      role: invite.role,
    })

    await tx
      .update(organizationInvitation)
      .set({
        acceptedAt: new Date(),
      })
      .where(eq(organizationInvitation.id, invitationId))

    await tx
      .update(profiles)
      .set({
        status: 'approved',
        approvedAt: new Date(),
      })
      .where(and(eq(profiles.id, userId), eq(profiles.status, 'pending')))
  })
}
