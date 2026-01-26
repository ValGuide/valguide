import type { DB } from '@valguide/core/features/db'
import { and, eq } from 'drizzle-orm'
import { type OrgRole, organizationInvitation } from './schema'

// =============================================================================
// TYPES
// =============================================================================

export type InviteMemberInput = {
  teamId: string
  email: string
  role: OrgRole
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

/**
 * Create an invitation (or update existing one for same email)
 */
export async function createInvitation(
  dbClient: DB,
  organizationId: string,
  email: string,
  role: OrgRole,
  invitedBy: string,
  tokenHash: string,
) {
  // Check if invitation already exists
  const existing = await dbClient.query.organizationInvitation.findFirst({
    where: and(eq(organizationInvitation.organizationId, organizationId), eq(organizationInvitation.email, email)),
  })

  if (existing) {
    // Update existing invitation
    const [updated] = await dbClient
      .update(organizationInvitation)
      .set({
        role,
        invitedBy,
        tokenHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        createdAt: new Date(),
      })
      .where(eq(organizationInvitation.id, existing.id))
      .returning()
    return updated
  }

  // Create new invitation
  const [invite] = await dbClient
    .insert(organizationInvitation)
    .values({
      organizationId,
      email,
      role,
      invitedBy,
      tokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    })
    .returning()

  return invite
}
