import { queryOptions } from '@tanstack/react-query'
import type { Theme } from '@valguide/core/features/themes/schema'
import { getThemesFn } from './get-themes'

export const themesQueryKey = () => ['themes'] as const

export const themesQueryOptions = () =>
  queryOptions<Theme[]>({
    queryKey: themesQueryKey(),
    queryFn: async () => {
      const data = await getThemesFn({ data: {} })
      return data as Theme[]
    },
  })
