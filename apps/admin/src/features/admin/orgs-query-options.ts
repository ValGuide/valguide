import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import type { ListOrgsInput } from '@/server/functions/list-orgs.fn'
import { adminListOrgsFn } from '@/server/functions/list-orgs.fn'

export const adminOrgsQueryOptions = (input: ListOrgsInput) =>
  queryOptions({
    queryKey: ['admin', 'orgs', input],
    queryFn: () => adminListOrgsFn({ data: input }),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  })
