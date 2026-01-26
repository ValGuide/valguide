import type { DB } from '@valguide/core/features/db'
import { and, eq, gt } from 'drizzle-orm'
import { organizationInvitation, organizationMember } from './schema'

// =============================================================================
// INTERNAL HELPERS (used by multiple operations)
// =============================================================================

/**
 * Get invitation by token hash (internal helper for join-team)
 */
export async function getInvitationByTokenHash(db: DB, tokenHash: string) {
  return db.query.organizationInvitation.findFirst({
    where: and(eq(organizationInvitation.tokenHash, tokenHash), gt(organizationInvitation.expiresAt, new Date())),
    with: {
      organization: true,
    },
  })
}

/**
 * Get invitation by ID (internal helper)
 */
export async function getInvitationById(db: DB, id: string) {
  return db.query.organizationInvitation.findFirst({
    where: eq(organizationInvitation.id, id),
  })
}

/**
 * Check if a user is a member of a team (internal helper)
 */
export async function isTeamMember(db: DB, teamId: string, userId: string) {
  const member = await db.query.organizationMember.findFirst({
    where: and(eq(organizationMember.organizationId, teamId), eq(organizationMember.userId, userId)),
  })

  return !!member
}

/**
 * Get user role in a team (internal helper)
 */
export async function getUserRole(db: DB, teamId: string, userId: string) {
  const member = await db.query.organizationMember.findFirst({
    where: and(eq(organizationMember.organizationId, teamId), eq(organizationMember.userId, userId)),
  })

  return member?.role ?? null
}
