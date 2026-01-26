import { createServerFn } from '@tanstack/react-start'
import { type DB, db } from '@valguide/core/features/db'
import { and, desc, eq, gt } from 'drizzle-orm'
import { authUsers } from 'drizzle-orm/supabase'
import { z } from 'zod'
import { requireOrgRole } from '../auth/authorization'
import { requireAuthMiddleware } from '../auth/middleware'
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
    .where(and(eq(organizationInvitation.organizationId, teamId), gt(organizationInvitation.expiresAt, new Date())))
    .orderBy(desc(organizationInvitation.createdAt))
}

// =============================================================================
// SERVER FUNCTION
// =============================================================================

const getPendingInvitationsSchema = z.object({
  teamId: z.string(),
})

export const getPendingInvitationsFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getPendingInvitationsSchema)
  .handler(async ({ context, data }) => {
    // Only admins and above can see pending invitations
    await requireOrgRole(data.teamId, context.user.id, 'admin')
    return getPendingInvitations(db, data.teamId)
  })
