import type { DB } from '@valguide/core/features/db'
import { and, desc, eq, gt } from 'drizzle-orm'
import { authUsers } from 'drizzle-orm/supabase'
import { profiles } from '../profiles/schema'
import { organization, organizationInvitation, organizationMember } from './schema'

/**
 * Get all teams a user belongs to
 */
export async function getUserTeams(db: DB, userId: string) {
  const members = await db.query.organizationMember.findMany({
    where: eq(organizationMember.userId, userId),
    with: {
      organization: true,
    },
  })

  return members.map((m: any) => ({
    ...m.organization,
    role: m.role,
  }))
}

/**
 * Get a team by ID
 */
export async function getTeamById(db: DB, id: string) {
  return db.query.organization.findFirst({
    where: eq(organization.id, id),
  })
}

/**
 * Get team members with profile details
 */
export async function getTeamMembers(db: DB, teamId: string) {
  return db
    .select({
      member: organizationMember,
      profile: profiles,
      user: authUsers,
    })
    .from(organizationMember)
    .leftJoin(profiles, eq(organizationMember.userId, profiles.id))
    .leftJoin(authUsers, eq(organizationMember.userId, authUsers.id))
    .where(eq(organizationMember.organizationId, teamId))
}

/**
 * Get pending invitations for a team with inviter details
 */
export async function getPendingInvitations(db: DB, teamId: string) {
  return db
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

/**
 * Get invitation by ID
 */
export async function getInvitationById(db: DB, id: string) {
  return db.query.organizationInvitation.findFirst({
    where: eq(organizationInvitation.id, id),
  })
}

/**
 * Get invitation by token hash
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
 * Check if a user is a member of a team
 */
export async function isTeamMember(db: DB, teamId: string, userId: string) {
  const member = await db.query.organizationMember.findFirst({
    where: and(eq(organizationMember.organizationId, teamId), eq(organizationMember.userId, userId)),
  })

  return !!member
}

/**
 * Get user role in a team
 */
export async function getUserRole(db: DB, teamId: string, userId: string) {
  const member = await db.query.organizationMember.findFirst({
    where: and(eq(organizationMember.organizationId, teamId), eq(organizationMember.userId, userId)),
  })

  return member?.role ?? null
}
