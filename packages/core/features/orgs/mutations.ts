import type { DB } from '@valguide/core/features/db'
import { and, eq } from 'drizzle-orm'
import { valguideId } from '../../utils/nanoid'
import { type OrgRole, organization, organizationInvitation, organizationMember } from './schema'

export type Organization = typeof organization.$inferSelect

export class SlugAlreadyExistsError extends Error {
  constructor() {
    super('Slug already exists')
    this.name = 'SlugAlreadyExistsError'
  }
}

/**
 * Create a new team
 */
export async function createTeam(db: DB, name: string, userId: string, slug?: string) {
  const teamSlug = slug || valguideId()

  try {
    return await db.transaction(async (tx: DB) => {
      const [newTeam] = await tx
        .insert(organization)
        .values({
          nanoId: valguideId(),
          name,
          slug: teamSlug,
        })
        .returning()

      if (!newTeam) {
        throw new Error('Failed to create team')
      }

      // Add creator as owner
      await tx.insert(organizationMember).values({
        organizationId: newTeam.id,
        userId,
        role: 'owner',
        isOwner: true, // Deprecated but kept for compat
      })

      return newTeam
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes('unique_org_slug')) {
      throw new SlugAlreadyExistsError()
    }
    throw error
  }
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
  tokenHash: string,
) {
  // Check if invitation already exists
  const existing = await db.query.organizationInvitation.findFirst({
    where: and(eq(organizationInvitation.organizationId, organizationId), eq(organizationInvitation.email, email)),
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
  return db.delete(organizationMember).where(eq(organizationMember.id, memberId))
}

/**
 * Update member role
 */
export async function updateMemberRole(db: DB, memberId: string, role: OrgRole) {
  return db.update(organizationMember).set({ role }).where(eq(organizationMember.id, memberId))
}

/**
 * Ensure user has at least one team, creating a default one if needed.
 * This is idempotent - safe to call multiple times.
 */
export async function ensureDefaultTeam(db: DB, userId: string, userName?: string): Promise<Organization> {
  // Check if user already has any team
  const existingMembership = await db.query.organizationMember.findFirst({
    where: eq(organizationMember.userId, userId),
    with: { organization: true },
  })

  if (existingMembership?.organization) {
    return existingMembership.organization
  }

  // Create a new team for the user using existing transactional createTeam
  const teamName = userName ? `${userName}'s Studio` : 'My Studio'
  const newTeam = await createTeam(db, teamName, userId)

  return newTeam
}
