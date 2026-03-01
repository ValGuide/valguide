import type { DB } from '@valguide/core/features/db'
import { and, desc, eq, gt, isNull, or } from 'drizzle-orm'
import { authUsers } from '../auth/schema'
import { profiles } from '../profiles/schema'
import { invitation } from './schema'

// =============================================================================
// TYPES
// =============================================================================

export type PendingInvitationWithDetails = {
  invitation: typeof invitation.$inferSelect
  inviter: typeof authUsers.$inferSelect | null
  inviterProfile: typeof profiles.$inferSelect | null
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

/**
 * Get pending invitations for a team with inviter details
 */
export async function getPendingInvitations(dbClient: DB, teamId: string): Promise<PendingInvitationWithDetails[]> {
  return dbClient
    .select({
      invitation,
      inviter: authUsers,
      inviterProfile: profiles,
    })
    .from(invitation)
    .leftJoin(authUsers, eq(invitation.inviterId, authUsers.id))
    .leftJoin(profiles, eq(invitation.inviterId, profiles.id))
    .where(
      and(
        eq(invitation.organizationId, teamId),
        eq(invitation.status, 'pending'),
        or(isNull(invitation.expiresAt), gt(invitation.expiresAt, new Date())),
      ),
    )
    .orderBy(desc(invitation.createdAt))
}
