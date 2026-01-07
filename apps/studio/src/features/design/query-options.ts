import { queryOptions } from '@tanstack/react-query'
import type { Theme } from '@valguide/core/features/themes/schema'
import { getThemesFn } from './server-functions'

export const themesQueryKey = (organizationId?: string) => ['themes', { organizationId }] as const

export const themesQueryOptions = (organizationId?: string) =>
  queryOptions<Theme[]>({
    queryKey: themesQueryKey(organizationId),
    queryFn: async () => {
      const data = await getThemesFn({ data: { organizationId } })
      return data as Theme[]
    },
    enabled: !!organizationId,
  })
