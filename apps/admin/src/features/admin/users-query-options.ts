import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import type { ListUsersInput } from '@valguide/core/features/admin/users/list-users.fn'
import { adminListUsersFn } from '@valguide/core/features/admin/users/list-users.fn'

export const adminUsersQueryOptions = (input: ListUsersInput) =>
  queryOptions({
    queryKey: ['admin', 'users', input],
    queryFn: () => adminListUsersFn({ data: input }),
    placeholderData: keepPreviousData,
  })
