import { createFileRoute } from '@tanstack/react-router'
import { InvitesPage } from '@/features/invites/components/invites-page'
import { currentUserInvitationsQueryOptions } from '@/features/invites/query-options'

export const Route = createFileRoute('/_main/invites')({
  loader: ({ context }) => context.queryClient.ensureQueryData(currentUserInvitationsQueryOptions()),
  component: InvitesPage,
})
