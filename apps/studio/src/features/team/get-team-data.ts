import { createServerFn } from '@tanstack/react-start'
import { db } from '@valguide/core/features/db'
import type { TeamMember } from '@valguide/core/features/orgs/components/members-table'
import type { PendingInvitation } from '@valguide/core/features/orgs/components/pending-invites-list'
import { getPendingInvitations } from '@valguide/core/features/orgs/get-pending-invitations'
import { getTeamById } from '@valguide/core/features/orgs/get-team'
import { getTeamMembers } from '@valguide/core/features/orgs/get-team-members'
import type { OrgRole } from '@valguide/core/features/orgs/schema'
import { getUserRole } from '@valguide/core/features/orgs/utils'
import { getUserDisplayName } from '@valguide/core/features/profiles/utils'
import { requireAuthMiddleware } from '@valguide/features/auth/middleware'
import type { Team } from './types'

// ============================================================================
// TYPES
// ============================================================================

export interface TeamData {
  team: Team
  members: TeamMember[]
  pendingInvites: PendingInvitation[]
  currentUserRole: OrgRole
  currentUserId: string
}

// ============================================================================
// SERVER FUNCTION
// ============================================================================

export const getTeamDataFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .handler(async ({ context }) => {
    const user = context.user
    const orgId = context.activeOrgId

    if (!orgId) {
      return null
    }

    const team = await getTeamById(db, orgId)

    if (!team) {
      return null
    }

    const currentUserRole = await getUserRole(db, team.id, user.id)

    if (!currentUserRole) {
      return null
    }

    const membersData = await getTeamMembers(db, team.id)
    const pendingInvitesData = await getPendingInvitations(db, team.id)

    const members = membersData.map(({ member, profile, user: authUser }) => ({
      id: member.id,
      userId: member.userId,
      email: authUser?.email || '',
      firstName: profile?.firstName,
      lastName: profile?.lastName,
      role: member.role as OrgRole,
      joinedAt: member.createdAt.toISOString(),
      isOwner: member.isOwner || false,
    }))

    const pendingInvites = pendingInvitesData.map(({ invitation, inviter, inviterProfile }) => ({
      id: invitation.id,
      email: invitation.email,
      role: invitation.role as OrgRole,
      invitedBy: {
        name: getUserDisplayName(inviterProfile, inviter?.email),
        email: inviter?.email || '',
      },
      invitedAt: invitation.createdAt.toISOString(),
      expiresAt: invitation.expiresAt.toISOString(),
    }))

    return {
      team,
      members,
      pendingInvites,
      currentUserRole: currentUserRole as OrgRole,
      currentUserId: user.id,
    }
  })
