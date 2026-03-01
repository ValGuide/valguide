import type { DB } from '@valguide/core/features/db'
import { and, eq, gt } from 'drizzle-orm'
import { invitation, member } from './schema'

// =============================================================================
// INTERNAL HELPERS (used by multiple operations)
// =============================================================================

/**
 * Get invitation by ID (internal helper)
 */
export async function getInvitationById(db: DB, id: string) {
  return db.query.invitation.findFirst({
    where: eq(invitation.id, id),
    with: {
      organization: true,
    },
  })
}

/**
 * Get invitation by ID only when still pending and not expired.
 */
export async function getPendingInvitationById(db: DB, id: string) {
  return db.query.invitation.findFirst({
    where: and(eq(invitation.id, id), eq(invitation.status, 'pending'), gt(invitation.expiresAt, new Date())),
    with: {
      organization: true,
    },
  })
}

/**
 * Check if a user is a member of a team (internal helper)
 */
export async function isTeamMember(db: DB, teamId: string, userId: string) {
  const membership = await db.query.member.findFirst({
    where: and(eq(member.organizationId, teamId), eq(member.userId, userId)),
  })

  return !!membership
}

/**
 * Get user role in a team (internal helper)
 */
export async function getUserRole(db: DB, teamId: string, userId: string) {
  const membership = await db.query.member.findFirst({
    where: and(eq(member.organizationId, teamId), eq(member.userId, userId)),
  })

  return membership?.role ?? null
}
