import { cancelInviteFn } from '@valguide/core/features/orgs/cancel-invite.fn'
import type { TeamData } from '@valguide/core/features/orgs/get-team-data.fn'
import { inviteMemberFn } from '@valguide/core/features/orgs/invite-member.fn'
import { removeMemberFn } from '@valguide/core/features/orgs/remove-member.fn'
import { resendInviteFn } from '@valguide/core/features/orgs/resend-invite.fn'
import { updateMemberRoleFn } from '@valguide/core/features/orgs/update-member-role.fn'
import { useTranslations } from '@valguide/core/i18n/client'
import { toast } from '@valguide/core/ui/components/sonner/state'
import { Button } from '@valguide/ui/components/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@valguide/ui/components/card'
import { UserPlus } from 'lucide-react'
import { InviteMemberDialog } from '@/features/orgs/components/invite-member-dialog'
import { MembersTable, type OrgRole } from '@/features/orgs/components/members-table'
import { PendingInvitesList } from '@/features/orgs/components/pending-invites-list'

interface WorkspaceMembersTabProps {
  data: TeamData
  onRefetch: () => Promise<void>
}

export function WorkspaceMembersTab({ data, onRefetch }: WorkspaceMembersTabProps) {
  const t = useTranslations('orgs.members')
  const tInvite = useTranslations('orgs.inviteDialog')
  const tPending = useTranslations('orgs.pendingInvites')

  const handleInvite = async (email: string, role: OrgRole) => {
    try {
      await inviteMemberFn({ data: { teamId: data.team.id, email, role } })
      toast.success(tInvite('success'))
      await onRefetch()
    } catch (error) {
      console.error('Error inviting member:', error)
      toast.error(tInvite('inviteError'))
      throw error
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    try {
      await removeMemberFn({ data: { memberId, teamId: data.team.id } })
      await onRefetch()
    } catch (error) {
      console.error('Error removing member:', error)
      toast.error(t('removeError'))
    }
  }

  const handleChangeRole = async (memberId: string, newRole: OrgRole) => {
    try {
      await updateMemberRoleFn({
        data: { memberId, teamId: data.team.id, newRole },
      })
      await onRefetch()
    } catch (error) {
      console.error('Error updating member role:', error)
      toast.error(t('roleUpdateError'))
    }
  }

  const handleResendInvite = async (inviteId: string) => {
    try {
      await resendInviteFn({ data: { inviteId, teamId: data.team.id } })
      toast.success(tPending('resendSuccess'))
      await onRefetch()
    } catch (error) {
      console.error('Error resending invite:', error)
      toast.error(tPending('resendError'))
    }
  }

  const handleCancelInvite = async (inviteId: string) => {
    try {
      await cancelInviteFn({ data: { inviteId, teamId: data.team.id } })
      await onRefetch()
    } catch (error) {
      console.error('Error canceling invite:', error)
      toast.error(tPending('cancelError'))
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="space-y-1">
            <CardTitle>{t('title')}</CardTitle>
            <CardDescription>{t('description')}</CardDescription>
          </div>
          {['owner', 'admin'].includes(data.currentUserRole) && (
            <CardAction>
              <InviteMemberDialog currentUserRole={data.currentUserRole} onInvite={handleInvite}>
                <Button size="sm" className="w-full sm:w-auto">
                  <UserPlus className="size-4" />
                  {tInvite('inviteMember')}
                </Button>
              </InviteMemberDialog>
            </CardAction>
          )}
        </CardHeader>
        <CardContent>
          <MembersTable
            members={data.members}
            currentUserRole={data.currentUserRole}
            currentUserId={data.currentUserId}
            onChangeRole={handleChangeRole}
            onRemoveMember={handleRemoveMember}
          />
        </CardContent>
      </Card>

      {data.pendingInvites.length > 0 && (
        <PendingInvitesList
          invitations={data.pendingInvites}
          onResendInvite={handleResendInvite}
          onCancelInvite={handleCancelInvite}
        />
      )}
    </div>
  )
}
