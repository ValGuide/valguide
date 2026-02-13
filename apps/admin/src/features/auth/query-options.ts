import { queryOptions } from '@tanstack/react-query'
import { type AdminUser, getCurrentAdminUserFn } from '@/server/functions/get-current-admin-user.fn'

export type { AdminUser }

export const currentUserQueryOptions = () =>
  queryOptions<AdminUser | null>({
    queryKey: ['current-user'],
    queryFn: () => getCurrentAdminUserFn(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
