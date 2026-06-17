import { useQuery } from '@tanstack/react-query'
import { currentUserInvitationsQueryOptions } from '../query-options'

export function useCurrentUserInvitations() {
  return useQuery(currentUserInvitationsQueryOptions())
}
