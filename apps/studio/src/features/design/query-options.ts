import { queryOptions } from '@tanstack/react-query'
import { listThemesFn, type Theme } from '@valguide/core/features/themes/list-themes'

export const themesQueryKey = () => ['themes'] as const

export const themesQueryOptions = () =>
  queryOptions<Theme[]>({
    queryKey: themesQueryKey(),
    queryFn: () => listThemesFn(),
    staleTime: 30 * 1000,
  })
