'use client'

import { MembersTable, type TeamMember, type OrgRole } from '@valguide/core/features/orgs/components/members-table'
import { PendingInvitesList, type PendingInvitation } from '@valguide/core/features/orgs/components/pending-invites-list'
import { InviteMemberDialog } from '@valguide/core/features/orgs/components/invite-member-dialog'
import { inviteMemberAction, removeMemberAction, updateMemberRoleAction, resendInviteAction, cancelInviteAction } from '@valguide/core/features/orgs/actions'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { type Team } from '@valguide/core/features/orgs/components/team-switcher'

interface TeamMembersClientProps {
  team: {
    id: string
    name: string
    slug: string
  }
  members: TeamMember[]
  pendingInvites: PendingInvitation[]
  currentUserRole: OrgRole
  currentUserId: string
  onAction?: () => void
}

export function TeamMembersClient({
  team,
  members,
  pendingInvites,
  currentUserRole,
  currentUserId,
  onAction
}: TeamMembersClientProps) {
  const t = useTranslations('orgs.members')
  const tInvite = useTranslations('orgs.inviteDialog')
  
  const handleInvite = async (email: string, role: OrgRole) => {
    try {
      await inviteMemberAction(team.id, email, role)
      toast.success('Invitation sent')
      onAction?.()
    } catch (error) {
      console.error(error)
      toast.error(tInvite('inviteError'))
      throw error
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    try {
      await removeMemberAction(memberId, team.id)
      toast.success('Member removed')
      onAction?.()
    } catch (error) {
      console.error(error)
      toast.error('Failed to remove member')
    }
  }

  const handleChangeRole = async (memberId: string, newRole: OrgRole) => {
    try {
      await updateMemberRoleAction(memberId, team.id, newRole)
      toast.success('Role updated')
      onAction?.()
    } catch (error) {
      console.error(error)
      toast.error('Failed to update role')
    }
  }

  const handleResendInvite = async (inviteId: string) => {
    try {
      await resendInviteAction(inviteId, team.id)
      toast.success('Invitation resent')
      onAction?.()
    } catch (error) {
      console.error(error)
      toast.error('Failed to resend invitation')
    }
  }

  const handleCancelInvite = async (inviteId: string) => {
    try {
      await cancelInviteAction(inviteId, team.id)
      toast.success('Invitation cancelled')
      onAction?.()
    } catch (error) {
      console.error(error)
      toast.error('Failed to cancel invitation')
    }
  }

  // MemberTable also has onResendInvite props, which is for re-sending invite to a member (maybe if they haven't accepted? but members table lists accepted members).
  // Ah, MembersTable handles ACTIVE members. PendingInvitesList handles PENDING invites.
  // So onResendInvite in MembersTable might be redundant or for a different purpose (e.g. if they are "invited" but in member table? No, schema separates them).
  // The MembersTable component has onResendInvite prop, maybe I should remove it or implement if I had logic for "re-onboarding".
  // For now, I'll just pass undefined or handle it if I want to email them again (e.g. "Welcome" email). 
  // Let's leave it undefined for members table for now.
  
  return (
    <div className="container mx-auto max-w-5xl py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team & Members</h1>
          <p className="text-muted-foreground">Manage your team members and their permissions.</p>
        </div>
        {['owner', 'admin'].includes(currentUserRole) && (
          <InviteMemberDialog currentUserRole={currentUserRole} onInvite={handleInvite} />
        )}
      </div>

      <div className="space-y-4">
        <MembersTable
          members={members}
          currentUserRole={currentUserRole}
          currentUserId={currentUserId}
          onChangeRole={handleChangeRole}
          onRemoveMember={handleRemoveMember}
        />
      </div>

      {pendingInvites.length > 0 && (
        <div className="space-y-4">
          <PendingInvitesList 
            invitations={pendingInvites}
            onResendInvite={handleResendInvite}
            onCancelInvite={handleCancelInvite}
          />
        </div>
      )}
    </div>
  )
}
