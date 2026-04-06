import { cancelInviteFn } from '@valguide/core/features/orgs/cancel-invite.fn'
import { inviteMemberFn } from '@valguide/core/features/orgs/invite-member.fn'
import { removeMemberFn } from '@valguide/core/features/orgs/remove-member.fn'
import { resendInviteFn } from '@valguide/core/features/orgs/resend-invite.fn'
import type { TeamData } from '@valguide/core/features/orgs/types'
import { updateMemberRoleFn } from '@valguide/core/features/orgs/update-member-role.fn'
import type { OrgRole } from '@/features/orgs/components/members-table'
import { WorkspaceMembersSection } from './workspace-members-section'

interface WorkspaceMembersSectionConnectedProps {
  data: TeamData
  onRefetch: () => Promise<void>
}

export function WorkspaceMembersSectionConnected({ data, onRefetch }: WorkspaceMembersSectionConnectedProps) {
  return (
    <WorkspaceMembersSection
      data={data}
      onInvite={async (email, role) => {
        await inviteMemberFn({ data: { teamId: data.team.id, email, role } })
        await onRefetch()
      }}
      onRemoveMember={async (memberId) => {
        await removeMemberFn({ data: { memberId, teamId: data.team.id } })
        await onRefetch()
      }}
      onChangeRole={async (memberId, newRole: OrgRole) => {
        await updateMemberRoleFn({
          data: { memberId, teamId: data.team.id, newRole },
        })
        await onRefetch()
      }}
      onResendInvite={async (inviteId) => {
        await resendInviteFn({ data: { inviteId, teamId: data.team.id } })
        await onRefetch()
      }}
      onCancelInvite={async (inviteId) => {
        await cancelInviteFn({ data: { inviteId, teamId: data.team.id } })
        await onRefetch()
      }}
    />
  )
}
