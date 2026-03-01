import type { DB } from '@valguide/core/features/db'
import { and, desc, eq, gt, isNull } from 'drizzle-orm'
import { authUsers } from '../auth/schema'
import { profiles } from '../profiles/schema'
import { organizationInvitation } from './schema'

// =============================================================================
// TYPES
// =============================================================================

export type PendingInvitationWithDetails = {
  invitation: typeof organizationInvitation.$inferSelect
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
      invitation: organizationInvitation,
      inviter: authUsers,
      inviterProfile: profiles,
    })
    .from(organizationInvitation)
    .leftJoin(authUsers, eq(organizationInvitation.invitedBy, authUsers.id))
    .leftJoin(profiles, eq(organizationInvitation.invitedBy, profiles.id))
    .where(
      and(
        eq(organizationInvitation.organizationId, teamId),
        gt(organizationInvitation.expiresAt, new Date()),
        isNull(organizationInvitation.acceptedAt),
        isNull(organizationInvitation.canceledAt),
      ),
    )
    .orderBy(desc(organizationInvitation.createdAt))
}
