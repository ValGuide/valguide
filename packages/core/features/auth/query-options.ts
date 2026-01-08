import { queryOptions } from '@tanstack/react-query'
import type { AuthUser } from './server-functions'
import { getCurrentUserFn } from './server-functions'

export const currentUserQueryOptions = () =>
  queryOptions<AuthUser | null>({
    queryKey: ['current-user'],
    queryFn: () => getCurrentUserFn(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
