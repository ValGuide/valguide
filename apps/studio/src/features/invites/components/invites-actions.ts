import type { QueryClient } from '@tanstack/react-query'
import { declineCurrentUserInvitationFn } from '@valguide/core/features/orgs/decline-current-user-invitation.fn'
import { joinTeamFn } from '@valguide/core/features/orgs/join-team.fn'
import type { CurrentUserInvitation } from '@valguide/core/features/orgs/list-current-user-invitations.fn'
import { switchTeamFn } from '@valguide/core/features/orgs/switch-team.fn'
import { toast } from '@valguide/core/ui/components/sonner/state'
import { currentUserInvitationsQueryKey } from '../query-options'

type InviteActionMessages = {
  acceptSuccess: (teamName: string) => string
  acceptError: string
  declineSuccess: string
  declineError: string
  switchWorkspace: string
  switchError: string
}

export async function acceptCurrentUserInvitation({
  invitation,
  queryClient,
  router,
  messages,
}: {
  invitation: CurrentUserInvitation
  queryClient: QueryClient
  router: { invalidate: () => Promise<void> }
  messages: InviteActionMessages
}) {
  await joinTeamFn({ data: { invitationId: invitation.id, switchToOrganization: false } })
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: currentUserInvitationsQueryKey }),
    queryClient.invalidateQueries({ queryKey: ['sidebar'] }),
  ])
  await router.invalidate()

  toast.success(messages.acceptSuccess(invitation.organizationName), {
    action: {
      label: messages.switchWorkspace,
      onClick: async () => {
        try {
          const result = await switchTeamFn({ data: { id: invitation.organizationId } })
          if (result?.success) {
            queryClient.removeQueries({ queryKey: ['sidebar'] })
            window.location.reload()
          }
        } catch (error) {
          console.error('Error switching team after accepting invite:', error)
          toast.error(messages.switchError)
        }
      },
    },
  })
}

export async function declineCurrentUserInvitation({
  invitation,
  queryClient,
  messages,
}: {
  invitation: CurrentUserInvitation
  queryClient: QueryClient
  messages: InviteActionMessages
}) {
  await declineCurrentUserInvitationFn({ data: { invitationId: invitation.id } })
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: currentUserInvitationsQueryKey }),
    queryClient.invalidateQueries({ queryKey: ['sidebar'] }),
  ])
  toast.success(messages.declineSuccess)
}
