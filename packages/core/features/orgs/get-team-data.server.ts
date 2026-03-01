import { db } from '../db'
import { getUserDisplayName } from '../profiles/utils'
import { getPendingInvitations } from './get-pending-invitations.server'
import { getTeamById } from './get-team.server'
import { getTeamMembers } from './get-team-members.server'
import { isOrgRole, type OrgRole } from './schema'
import type { Organization, PendingInvitation, TeamMember } from './types'
import { getUserRole } from './utils'

// =============================================================================
// TYPES
// =============================================================================

export interface TeamData {
  team: Organization
  members: TeamMember[]
  pendingInvites: PendingInvitation[]
  currentUserRole: OrgRole
  currentUserId: string
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function getTeamData(orgId: string, userId: string): Promise<TeamData | null> {
  const team = await getTeamById(db, orgId)
  if (!team) {
    return null
  }

  const currentUserRole = await getUserRole(db, team.id, userId)
  if (!currentUserRole || !isOrgRole(currentUserRole)) {
    return null
  }

  const membersData = await getTeamMembers(db, team.id)
  const pendingInvitesData = await getPendingInvitations(db, team.id)

  const members: TeamMember[] = membersData.flatMap(({ member, profile, user: authUser }) => {
    if (!isOrgRole(member.role)) {
      return []
    }

    return {
      id: member.id,
      userId: member.userId,
      email: authUser?.email ?? '',
      firstName: profile?.firstName,
      lastName: profile?.lastName,
      role: member.role,
      joinedAt: member.createdAt.toISOString(),
    }
  })

  const pendingInvites: PendingInvitation[] = pendingInvitesData.flatMap(({ invitation, inviter, inviterProfile }) => {
    if (!isOrgRole(invitation.role)) {
      return []
    }

    return {
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      invitedBy: {
        name: getUserDisplayName(inviterProfile, inviter?.email),
        email: inviter?.email ?? '',
      },
      invitedAt: invitation.createdAt.toISOString(),
      expiresAt: invitation.expiresAt?.toISOString() ?? '',
    }
  })

  return {
    team,
    members,
    pendingInvites,
    currentUserRole,
    currentUserId: userId,
  }
}
