import { queryOptions } from '@tanstack/react-query'
import type { AuthUser } from '@valguide/core/features/auth/server-functions'
import { getCurrentUserFn } from '@valguide/core/features/auth/server-functions'

export const currentUserQueryOptions = () =>
  queryOptions<AuthUser | null>({
    queryKey: ['current-user'],
    queryFn: () => getCurrentUserFn(),
    staleTime: 5 * 60 * 1000, // 5 minutes - user auth rarely changes during a session
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
