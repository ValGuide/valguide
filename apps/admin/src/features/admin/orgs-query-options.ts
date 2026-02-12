import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import type { ListOrgsInput } from '@valguide/core/features/admin/orgs/list-orgs.fn'
import { adminListOrgsFn } from '@valguide/core/features/admin/orgs/list-orgs.fn'

export const adminOrgsQueryOptions = (input: ListOrgsInput) =>
  queryOptions({
    queryKey: ['admin', 'orgs', input],
    queryFn: () => adminListOrgsFn({ data: input }),
    placeholderData: keepPreviousData,
  })
