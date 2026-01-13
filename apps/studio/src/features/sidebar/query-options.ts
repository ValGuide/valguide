import { queryOptions } from '@tanstack/react-query'
import type { SidebarData } from './api/fetchers'
import { getSidebarDataFn } from './server-functions'

export const sidebarQueryOptions = () =>
  queryOptions<SidebarData | null>({
    queryKey: ['sidebar'],
    queryFn: async () => {
      try {
        const data = await getSidebarDataFn()
        return data as SidebarData | null
      } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
          return null
        }
        throw error
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - prevents refetches on navigation
  })
