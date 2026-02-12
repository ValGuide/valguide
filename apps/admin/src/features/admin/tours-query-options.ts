import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import type { ListToursInput } from '@valguide/core/features/admin/tours/list-tours.fn'
import { adminListToursFn } from '@valguide/core/features/admin/tours/list-tours.fn'

export const adminToursQueryOptions = (input: ListToursInput) =>
  queryOptions({
    queryKey: ['admin', 'tours', input],
    queryFn: () => adminListToursFn({ data: input }),
    placeholderData: keepPreviousData,
  })
