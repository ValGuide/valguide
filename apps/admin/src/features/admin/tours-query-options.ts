import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import type { ListToursInput } from '@/server/functions/list-tours.fn'
import { adminListToursFn } from '@/server/functions/list-tours.fn'

export const adminToursQueryOptions = (input: ListToursInput) =>
  queryOptions({
    queryKey: ['admin', 'tours', input],
    queryFn: () => adminListToursFn({ data: input }),
    placeholderData: keepPreviousData,
  })
