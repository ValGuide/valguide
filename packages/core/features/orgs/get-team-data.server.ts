import { db } from '../db'
import { getUserDisplayName } from '../profiles/utils'
import type { TeamMember } from './components/members-table'
import type { PendingInvitation } from './components/pending-invites-list'
import { getPendingInvitations } from './get-pending-invitations.server'
import { getTeamById } from './get-team.server'
import { getTeamMembers } from './get-team-members.server'
import type { OrgRole } from './schema'
import type { Organization } from './types'
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
  if (!currentUserRole) {
    return null
  }

  const membersData = await getTeamMembers(db, team.id)
  const pendingInvitesData = await getPendingInvitations(db, team.id)

  const members: TeamMember[] = membersData.map(({ member, profile, user: authUser }) => ({
    id: member.id,
    userId: member.userId,
    email: authUser?.email ?? '',
    firstName: profile?.firstName,
    lastName: profile?.lastName,
    role: member.role as OrgRole,
    joinedAt: member.createdAt.toISOString(),
    isOwner: member.isOwner ?? false,
  }))

  const pendingInvites: PendingInvitation[] = pendingInvitesData.map(({ invitation, inviter, inviterProfile }) => ({
    id: invitation.id,
    email: invitation.email,
    role: invitation.role as OrgRole,
    invitedBy: {
      name: getUserDisplayName(inviterProfile, inviter?.email),
      email: inviter?.email ?? '',
    },
    invitedAt: invitation.createdAt.toISOString(),
    expiresAt: invitation.expiresAt.toISOString(),
  }))

  return {
    team,
    members,
    pendingInvites,
    currentUserRole: currentUserRole as OrgRole,
    currentUserId: userId,
  }
}
