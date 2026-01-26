import { queryOptions } from '@tanstack/react-query'
import { getSidebarDataFn, type SidebarData } from './get-sidebar-data'
import { getSidebarStateFn } from './get-sidebar-state'

export const sidebarStateQueryOptions = () =>
  queryOptions<boolean>({
    queryKey: ['sidebar-state'],
    queryFn: () => getSidebarStateFn(),
    staleTime: 5 * 60 * 1000,
  })

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
    staleTime: 5 * 60 * 1000,
  })
