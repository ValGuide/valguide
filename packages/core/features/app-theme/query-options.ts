import { queryOptions } from '@tanstack/react-query'
import type { Theme } from './types'

type GetThemeFn = () => Promise<Theme>

export const createThemeQueryOptions = (getThemeFn: GetThemeFn) =>
  queryOptions<Theme>({
    queryKey: ['theme'],
    queryFn: () => getThemeFn(),
    staleTime: 5 * 60 * 1000,
    retry: false, // fail fast in beforeLoad — retries would brick the app
  })
