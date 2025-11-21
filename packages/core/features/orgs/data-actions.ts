'use server'

import { createClient } from '../../supabase/server'
import { db } from '../db'
import { getTeamBySlug, getTeamMembers, getPendingInvitations, getUserRole } from './queries'
import { getActiveTeamSlug } from './context-actions'
import { type OrgRole } from './schema'

export async function getTeamDataAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    console.info('no user')
    return null
  }

  const teamSlug = await getActiveTeamSlug()

  if (!teamSlug){
    console.info('no team slug')
     return null
  }

  const team = await getTeamBySlug(db, teamSlug)


  if (!team) {
    console.info('no team')
    return null
  }

  const membersData = await getTeamMembers(db, team.id)
  const pendingInvitesData = await getPendingInvitations(db, team.id)
  const currentUserRole = await getUserRole(db, team.id, user.id)

  if (!currentUserRole) {
    return null
  }

  // Transform data for client component
  const members = membersData.map(({ member, profile, user: authUser }: any) => ({
    id: member.id,
    userId: member.userId,
    email: authUser?.email || '',
    firstName: profile?.firstName,
    lastName: profile?.lastName,
    role: member.role as OrgRole,
    joinedAt: member.createdAt.toISOString(),
    isOwner: member.isOwner || false
  }))

  const pendingInvites = pendingInvitesData.map(({ invitation, inviter, inviterProfile }: any) => ({
    id: invitation.id,
    email: invitation.email,
    role: invitation.role as OrgRole,
    invitedBy: {
      name: inviterProfile?.firstName && inviterProfile?.lastName 
            ? `${inviterProfile.firstName} ${inviterProfile.lastName}`
            : inviter?.email?.split('@')[0] || 'Unknown',
      email: inviter?.email || ''
    },
    invitedAt: invitation.createdAt.toISOString(),
    expiresAt: invitation.expiresAt.toISOString()
  }))

  return {
    team,
    members,
    pendingInvites,
    currentUserRole: currentUserRole as OrgRole,
    currentUserId: user.id
  }
}
