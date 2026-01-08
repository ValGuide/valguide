import { queryOptions } from '@tanstack/react-query'
import { getThemeFn } from './server-functions'
import type { Theme } from './types'

export const themeQueryOptions = () =>
  queryOptions<Theme>({
    queryKey: ['theme'],
    queryFn: () => getThemeFn(),
    staleTime: 5 * 60 * 1000,
  })
