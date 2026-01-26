import type { DB } from '@valguide/core/features/db'
import { eq } from 'drizzle-orm'
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
