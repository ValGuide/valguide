import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import type { ListUsersInput } from '@/server/functions/list-users.fn'
import { adminListUsersFn } from '@/server/functions/list-users.fn'

export const adminUsersQueryOptions = (input: ListUsersInput) =>
  queryOptions({
    queryKey: ['admin', 'users', input],
    queryFn: () => adminListUsersFn({ data: input }),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  })
