import { queryOptions } from '@tanstack/react-query'
import { getMaintenanceStatusFn } from '@/server/functions/get-maintenance-status.fn'

export const adminMaintenanceQueryOptions = () =>
  queryOptions({
    queryKey: ['admin', 'maintenance'],
    queryFn: () => getMaintenanceStatusFn(),
    staleTime: 10_000,
  })
