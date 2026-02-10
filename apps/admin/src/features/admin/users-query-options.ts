import { queryOptions } from '@tanstack/react-query'
import { adminListUsersFn } from '@valguide/core/features/admin/users/list-users.fn'

export const adminUsersQueryOptions = (status?: 'pending' | 'approved' | 'blocked') =>
  queryOptions({
    queryKey: ['admin', 'users', { status }],
    queryFn: () => adminListUsersFn({ data: { status } }),
  })
