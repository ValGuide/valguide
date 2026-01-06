import { createServerFn } from '@tanstack/react-start'
import { db } from '@valguide/core/features/db'
import { getPendingInvitations, getTeamBySlug, getTeamMembers, getUserRole } from '@valguide/core/features/orgs/queries'
import type { OrgRole } from '@valguide/core/features/orgs/schema'
import { getUserDisplayName } from '@valguide/core/features/profiles/utils'
import { createClient } from '@valguide/supabase/server'
import { getActiveTeamSlug } from '../../utils/cookies'

export const getTeamDataFn = createServerFn({ method: 'GET' }).handler(async () => {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const user = data?.claims

  if (!user) {
    throw new Error('Unauthorized')
  }

  const teamSlug = getActiveTeamSlug()

  if (!teamSlug) {
    return null
  }

  const team = await getTeamBySlug(db, teamSlug)

  if (!team) {
    return null
  }

  const currentUserRole = await getUserRole(db, team.id, user.sub)

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
    currentUserId: user.sub,
  }
})
