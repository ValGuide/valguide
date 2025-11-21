'use server'

import { createClient } from '../../supabase/server'
import { db } from '../db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { 
  createTeam, 
  createInvitation, 
  deleteInvitation, 
  removeMember, 
  updateMemberRole,
  acceptInvitation
} from './mutations'
import { 
  getUserRole, 
  getInvitationByTokenHash, 
  getTeamBySlug, 
  isTeamMember,
  getPendingInvitations,
  getInvitationById
} from './queries'
import { 
  canManageMembers, 
  OrgRole 
} from './permissions'
import { randomBytes, createHash } from 'crypto'
import { cookies } from 'next/headers'

export async function createTeamAction(name: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const team = await createTeam(db, name, user.id)
  
  // Set cookie for new team
  const cookieStore = await cookies()
  cookieStore.set('active-team-slug', team.slug, {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365, // 1 year
  })

  revalidatePath('/studio')
  return team
}

export async function inviteMemberAction(teamId: string, email: string, role: OrgRole) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const currentUserRole = await getUserRole(db, teamId, user.id)
  
  if (!currentUserRole || !canManageMembers(currentUserRole as OrgRole)) {
    throw new Error('Insufficient permissions')
  }

  // Generate token
  const token = randomBytes(32).toString('hex')
  const tokenHash = createHash('sha256').update(token).digest('hex')

  await createInvitation(db, teamId, email, role, user.id, tokenHash)

  // TODO: Send email using Resend
  // await sendEmail({
  //   to: email,
  //   template: 'team-invite',
  //   data: {
  //     inviteLink: `${process.env.NEXT_PUBLIC_APP_URL}/join-team?token=${token}`,
  //     teamName: team.name,
  //     inviterName: user.email
  //   }
  // })
  
  console.log(`Invite link for ${email}: /join-team?token=${token}`)

  revalidatePath('/')
}

export async function resendInviteAction(inviteId: string, teamId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const currentUserRole = await getUserRole(db, teamId, user.id)
  
  if (!currentUserRole || !canManageMembers(currentUserRole as OrgRole)) {
    throw new Error('Insufficient permissions')
  }
  
  const invite = await getInvitationById(db, inviteId)
  if (!invite) throw new Error('Invitation not found')

  // Generate token
  const token = randomBytes(32).toString('hex')
  const tokenHash = createHash('sha256').update(token).digest('hex')

  await createInvitation(db, teamId, invite.email, invite.role as OrgRole, user.id, tokenHash)

  // TODO: Send email
  console.log(`Resend invite link for ${invite.email}: /join-team?token=${token}`)

  revalidatePath('/')
}

export async function cancelInviteAction(inviteId: string, teamId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const currentUserRole = await getUserRole(db, teamId, user.id)
  
  if (!currentUserRole || !canManageMembers(currentUserRole as OrgRole)) {
    throw new Error('Insufficient permissions')
  }

  await deleteInvitation(db, inviteId)
  revalidatePath('/')
}

export async function removeMemberAction(memberId: string, teamId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const currentUserRole = await getUserRole(db, teamId, user.id)
  
  if (!currentUserRole || !canManageMembers(currentUserRole as OrgRole)) {
    throw new Error('Insufficient permissions')
  }

  await removeMember(db, memberId)
  revalidatePath('/')
}

export async function updateMemberRoleAction(memberId: string, teamId: string, newRole: OrgRole) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const currentUserRole = await getUserRole(db, teamId, user.id)
  
  if (!currentUserRole || !canManageMembers(currentUserRole as OrgRole)) {
    throw new Error('Insufficient permissions')
  }

  await updateMemberRole(db, memberId, newRole)
  revalidatePath('/')
}

export async function joinTeamAction(token: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const tokenHash = createHash('sha256').update(token).digest('hex')
  const invite = await getInvitationByTokenHash(db, tokenHash)

  if (!invite) {
    throw new Error('Invalid or expired invitation')
  }

  // Check if already member
  const isMember = await isTeamMember(db, invite.organizationId, user.id)
  if (isMember) {
    return { success: true, slug: invite.organization.slug }
  }

  await acceptInvitation(db, invite.id, user.id)
  
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
