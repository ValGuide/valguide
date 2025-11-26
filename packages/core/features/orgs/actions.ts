'use server'

import { createHash, randomBytes } from 'crypto'
import { cookies } from 'next/headers'
import { createClient } from '../../supabase/server'
import { db } from '../db'
import {
  acceptInvitation,
  createInvitation,
  createTeam,
  deleteInvitation,
  removeMember,
  updateMemberRole,
} from './mutations'
import { canManageMembers, OrgRole } from './permissions'
import {
  getInvitationById,
  getInvitationByTokenHash,
  getTeamById,
  getUserRole,
  isTeamMember,
} from './queries'
import { sendEmail } from '@valguide/transactional'

export async function createTeamAction(name: string, slug?: string) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const user = data?.claims

  if (!user) {
    throw new Error('Unauthorized')
  }

  const team = await createTeam(db, name, user.sub, slug)

  // Set cookie for new team
  const cookieStore = await cookies()
  cookieStore.set('active-team-slug', team.slug, {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365, // 1 year
  })

  return team
}

export async function inviteMemberAction(teamId: string, email: string, role: OrgRole) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const user = data?.claims

  if (!user) {
    throw new Error('Unauthorized')
  }

  const currentUserRole = await getUserRole(db, teamId, user.sub)

  if (!currentUserRole || !canManageMembers(currentUserRole as OrgRole)) {
    throw new Error('Insufficient permissions')
  }

  const team = await getTeamById(db, teamId)
  if (!team) throw new Error('Team not found')

  // Generate token
  const token = randomBytes(32).toString('hex')
  const tokenHash = createHash('sha256').update(token).digest('hex')

  await createInvitation(db, teamId, email, role, user.sub, tokenHash)

  await sendEmail({
    to: email,
    subject: `Join ${team.name} on ValGuide`,
    template: {
      name: 'team-invite',
      data: {
        inviteLink: `${process.env.NEXT_PUBLIC_STUDIO_URL}/join-team?token=${token}`,
        teamName: team.name,
        inviterName: user.email || 'A colleague',
        logoUrl: `${process.env.NEXT_PUBLIC_STUDIO_URL}/icon.png`,
      },
    },
  })

  console.log(`Invite link for ${email}: /join-team?token=${token}`)
}

export async function resendInviteAction(inviteId: string, teamId: string) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const user = data?.claims

  if (!user) {
    throw new Error('Unauthorized')
  }

  const currentUserRole = await getUserRole(db, teamId, user.sub)

  if (!currentUserRole || !canManageMembers(currentUserRole as OrgRole)) {
    throw new Error('Insufficient permissions')
  }

  const invite = await getInvitationById(db, inviteId)
  if (!invite) throw new Error('Invitation not found')

  const team = await getTeamById(db, teamId)
  if (!team) throw new Error('Team not found')

  // Generate token
  const token = randomBytes(32).toString('hex')
  const tokenHash = createHash('sha256').update(token).digest('hex')

  await createInvitation(db, teamId, invite.email, invite.role as OrgRole, user.sub, tokenHash)

  await sendEmail({
    to: invite.email,
    subject: `Join ${team.name} on ValGuide`,
    template: {
      name: 'team-invite',
      data: {
        inviteLink: `${process.env.NEXT_PUBLIC_STUDIO_URL}/join-team?token=${token}`,
        teamName: team.name,
        inviterName: user.email || 'A colleague',
        logoUrl: `${process.env.NEXT_PUBLIC_STUDIO_URL}/icon.png`,
      },
    },
  })

  console.log(`Resend invite link for ${invite.email}: /join-team?token=${token}`)
}

export async function cancelInviteAction(inviteId: string, teamId: string) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const user = data?.claims

  if (!user) {
    throw new Error('Unauthorized')
  }

  const currentUserRole = await getUserRole(db, teamId, user.sub)

  if (!currentUserRole || !canManageMembers(currentUserRole as OrgRole)) {
    throw new Error('Insufficient permissions')
  }

  await deleteInvitation(db, inviteId)
}

export async function removeMemberAction(memberId: string, teamId: string) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const user = data?.claims

  if (!user) {
    throw new Error('Unauthorized')
  }

  const currentUserRole = await getUserRole(db, teamId, user.sub)

  if (!currentUserRole || !canManageMembers(currentUserRole as OrgRole)) {
    throw new Error('Insufficient permissions')
  }

  await removeMember(db, memberId)
}

export async function updateMemberRoleAction(memberId: string, teamId: string, newRole: OrgRole) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const user = data?.claims

  if (!user) {
    throw new Error('Unauthorized')
  }

  const currentUserRole = await getUserRole(db, teamId, user.sub)

  if (!currentUserRole || !canManageMembers(currentUserRole as OrgRole)) {
    throw new Error('Insufficient permissions')
  }

  await updateMemberRole(db, memberId, newRole)
}

export async function joinTeamAction(token: string) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const user = data?.claims

  if (!user) {
    throw new Error('Unauthorized')
  }

  const tokenHash = createHash('sha256').update(token).digest('hex')
  const invite = await getInvitationByTokenHash(db, tokenHash)

  if (!invite) {
    throw new Error('Invalid or expired invitation')
  }

  // Check if already member
  const isMember = await isTeamMember(db, invite.organizationId, user.sub)
  if (isMember) {
    return { success: true, slug: invite.organization.slug }
  }

  // Verify email matches
  if (invite.email.toLowerCase() !== (user.email || '').toLowerCase()) {
    throw new Error(`This invitation is for ${invite.email}, but you are signed in as ${user.email}`)
  }

  await acceptInvitation(db, invite.id, user.sub)

  // Set cookie for new team
  const cookieStore = await cookies()
  cookieStore.set('active-team-slug', invite.organization.slug, {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365, // 1 year
  })

  return { success: true, slug: invite.organization.slug }
}
