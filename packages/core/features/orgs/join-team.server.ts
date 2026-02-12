import type { DB } from '@valguide/core/features/db'
import { eq } from 'drizzle-orm'
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

    // Upsert profile: create if missing (new user via invite OTP), approve if pending.
    // The profile may not exist yet when the user is created via verifyOtp —
    // there's no DB trigger creating it automatically.
    await tx
      .insert(profiles)
      .values({
        id: userId,
        status: 'approved',
        approvedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: profiles.id,
        set: {
          status: 'approved',
          approvedAt: new Date(),
        },
        setWhere: eq(profiles.status, 'pending'),
      })
  })
}
