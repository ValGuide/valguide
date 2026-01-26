import { queryOptions } from '@tanstack/react-query'
import { type AuthUser, getCurrentUserFn } from './get-current-user'
import { isAuthenticatedFn } from './is-authenticated'

export const currentUserQueryOptions = () =>
  queryOptions<AuthUser | null>({
    queryKey: ['current-user'],
    queryFn: () => getCurrentUserFn(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

export const isAuthenticatedQueryOptions = () =>
  queryOptions<boolean>({
    queryKey: ['is-authenticated'],
    queryFn: () => isAuthenticatedFn(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
