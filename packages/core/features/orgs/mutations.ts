import { eq, and } from 'drizzle-orm'
import type { DB } from '../db'
import { organization, organizationMember, organizationInvitation, type OrgRole } from './schema'
import { customAlphabet } from 'nanoid'

const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 10)

/**
 * Create a new team
 */
export async function createTeam(db: DB, name: string, userId: string, slug?: string) {
  const teamSlug = slug || nanoid()
  
  return await db.transaction(async (tx: DB) => {
    const [newTeam] = await tx
      .insert(organization)
      .values({
        name,
        slug: teamSlug,
      })
      .returning()

    // Add creator as owner
    await tx.insert(organizationMember).values({
      organizationId: newTeam.id,
      userId,
      role: 'owner',
      isOwner: true, // Deprecated but kept for compat
    })

    return newTeam
  })
}

/**
 * Create an invitation
 */
export async function createInvitation(
  db: DB,
  organizationId: string,
  email: string,
  role: OrgRole,
  invitedBy: string,
  tokenHash: string
) {
  // Check if invitation already exists
  const existing = await db.query.organizationInvitation.findFirst({
    where: and(
      eq(organizationInvitation.organizationId, organizationId),
      eq(organizationInvitation.email, email)
    ),
  })

  if (existing) {
    // Update existing invitation
    const [updated] = await db
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
  const [invite] = await db
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

/**
 * Accept an invitation
 */
export async function acceptInvitation(db: DB, invitationId: string, userId: string) {
  return await db.transaction(async (tx: DB) => {
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

    // Delete invitation (or mark accepted)
    await tx
      .update(organizationInvitation)
      .set({
        acceptedAt: new Date(),
      })
      .where(eq(organizationInvitation.id, invitationId))
      
    // We can also delete it to keep table clean, but keeping it for history might be good.
    // However, if we want to allow re-inviting same email if they leave, we should probably soft-delete or just rely on unique constraint being on email+org?
    // schema says: email is varchar. Index on email. No unique constraint on (orgId, email).
    // But I should delete it to avoid clutter or confusion.
    // The plan says "acceptedAt: timestamp", so we keep it.
  })
}

/**
 * Cancel/Delete an invitation
 */
export async function deleteInvitation(db: DB, invitationId: string) {
  return db.delete(organizationInvitation).where(eq(organizationInvitation.id, invitationId))
}

/**
 * Remove a member
 */
export async function removeMember(db: DB, memberId: string) {
  return db
    .delete(organizationMember)
    .where(eq(organizationMember.id, memberId))
}

/**
 * Update member role
 */
export async function updateMemberRole(db: DB, memberId: string, role: OrgRole) {
  return db
    .update(organizationMember)
    .set({ role })
    .where(eq(organizationMember.id, memberId))
}
