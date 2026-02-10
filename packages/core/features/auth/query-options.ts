import { queryOptions } from '@tanstack/react-query'
import { type AuthUser, getCurrentUserFn } from './get-current-user.fn'
import { getUserStatusFn, type UserStatus } from './get-user-status.fn'
import { isAuthenticatedFn } from './is-authenticated.fn'

export type { UserStatus }

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

export const userStatusQueryOptions = () =>
  queryOptions({
    queryKey: ['user-status'],
    queryFn: () => getUserStatusFn(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
