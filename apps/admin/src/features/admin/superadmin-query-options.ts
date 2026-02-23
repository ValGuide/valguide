import { queryOptions } from '@tanstack/react-query'
import { checkSuperadminFn } from '@/server/functions/check-superadmin.fn'

export const superadminQueryOptions = () =>
  queryOptions({
    queryKey: ['admin', 'superadmin-check'],
    queryFn: () => checkSuperadminFn(),
    staleTime: 5 * 60 * 1000,
  })
