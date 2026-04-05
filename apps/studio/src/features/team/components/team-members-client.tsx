import { cancelInviteFn } from '@valguide/core/features/orgs/cancel-invite.fn'
import { inviteMemberFn } from '@valguide/core/features/orgs/invite-member.fn'
import { REMOVE_MEMBER_ERROR } from '@valguide/core/features/orgs/remove-member.errors'
import { removeMemberFn } from '@valguide/core/features/orgs/remove-member.fn'
import { resendInviteFn } from '@valguide/core/features/orgs/resend-invite.fn'
import { updateMemberRoleFn } from '@valguide/core/features/orgs/update-member-role.fn'
import { useTranslations } from '@valguide/core/i18n/client'
import { toast } from '@valguide/core/ui/components/sonner/state'
import type { PendingInvitation, TeamMember } from '@valguide/features/orgs/types.ts'
import { PageTitle } from '@valguide/ui/components/page-title'
import * as React from 'react'
import { InviteMemberDialog } from '@/features/orgs/components/invite-member-dialog'
import { MembersTable, type OrgRole } from '@/features/orgs/components/members-table'
import { PendingInvitesList } from '@/features/orgs/components/pending-invites-list'
import { RemoveMemberDialog } from '@/features/orgs/components/remove-member-dialog'

interface TeamMembersClientProps {
  team: {
    id: string
    name: string
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
  onAction,
}: TeamMembersClientProps) {
  const t = useTranslations('orgs.members')
  const tInvite = useTranslations('orgs.inviteDialog')
  const tPending = useTranslations('orgs.pendingInvites')
  const [memberToRemove, setMemberToRemove] = React.useState<TeamMember | null>(null)
  const [isRemoving, setIsRemoving] = React.useState(false)

  const getRemoveErrorMessage = (error: unknown) => {
    if (!(error instanceof Error)) {
      return t('removeError')
    }

    switch (error.message) {
      case REMOVE_MEMBER_ERROR.notFound:
        return t('removeNotFoundError')
      case REMOVE_MEMBER_ERROR.cannotRemoveSelf:
        return t('removeSelfError')
      case REMOVE_MEMBER_ERROR.adminCannotRemoveOwner:
        return t('removeOwnerAsAdminError')
      case REMOVE_MEMBER_ERROR.lastOwner:
        return t('removeLastOwnerError')
      default:
        return t('removeError')
    }
  }

  const handleInvite = async (email: string, role: OrgRole) => {
    try {
      await inviteMemberFn({ data: { teamId: team.id, email, role } })
      toast.success(tInvite('success'))
      onAction?.()
    } catch (error) {
      console.error('Error inviting member:', error)
      toast.error(tInvite('inviteError'))
      throw error
    }
  }

  const handleRemoveMember = async () => {
    if (!memberToRemove) {
      return
    }

    setIsRemoving(true)
    try {
      await removeMemberFn({ data: { memberId: memberToRemove.id, teamId: team.id } })
      toast.success(t('removeSuccess'))
      setMemberToRemove(null)
      onAction?.()
    } catch (error) {
      console.error('Error removing member:', error)
      toast.error(getRemoveErrorMessage(error))
    } finally {
      setIsRemoving(false)
    }
  }

  const handleChangeRole = async (memberId: string, newRole: OrgRole) => {
    try {
      await updateMemberRoleFn({
        data: { memberId, teamId: team.id, newRole },
      })
      onAction?.()
    } catch (error) {
      console.error('Error updating member role:', error)
      toast.error(t('roleUpdateError'))
    }
  }

  const handleResendInvite = async (inviteId: string) => {
    try {
      await resendInviteFn({ data: { inviteId, teamId: team.id } })
      toast.success(tPending('resendSuccess'))
      onAction?.()
    } catch (error) {
      console.error('Error resending invite:', error)
      toast.error(tPending('resendError'))
    }
  }

  const handleCancelInvite = async (inviteId: string) => {
    try {
      await cancelInviteFn({ data: { inviteId, teamId: team.id } })
      onAction?.()
    } catch (error) {
      console.error('Error canceling invite:', error)
      toast.error(tPending('cancelError'))
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <PageTitle as="h2">{t('title')}</PageTitle>
          <p className="text-sm text-muted-foreground">{t('description')}</p>
        </div>
        {['owner', 'admin'].includes(currentUserRole) && (
          <InviteMemberDialog currentUserRole={currentUserRole} onInvite={handleInvite} />
        )}
      </div>

      <MembersTable
        members={members}
        currentUserRole={currentUserRole}
        currentUserId={currentUserId}
        onChangeRole={handleChangeRole}
        onRemoveMember={setMemberToRemove}
      />

      {pendingInvites.length > 0 && (
        <PendingInvitesList
          invitations={pendingInvites}
          onResendInvite={handleResendInvite}
          onCancelInvite={handleCancelInvite}
        />
      )}

      <RemoveMemberDialog
        member={memberToRemove}
        open={memberToRemove !== null}
        isRemoving={isRemoving}
        onConfirm={handleRemoveMember}
        onOpenChange={(open) => {
          if (!open && !isRemoving) {
            setMemberToRemove(null)
          }
        }}
      />
    </div>
  )
}
