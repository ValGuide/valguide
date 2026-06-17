import { queryOptions } from '@tanstack/react-query'
import {
  type CurrentUserInvitation,
  listCurrentUserInvitationsFn,
} from '@valguide/core/features/orgs/list-current-user-invitations.fn'

export const currentUserInvitationsQueryKey = ['current-user-invitations'] as const

export const currentUserInvitationsQueryOptions = () =>
  queryOptions<CurrentUserInvitation[]>({
    queryKey: currentUserInvitationsQueryKey,
    queryFn: async () => listCurrentUserInvitationsFn(),
    staleTime: 60 * 1000,
  })
