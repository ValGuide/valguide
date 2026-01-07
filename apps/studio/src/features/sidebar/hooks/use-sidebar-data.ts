import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { SidebarData } from '../api/fetchers'
import { getSidebarDataFn } from '../server-functions'

async function fetchSidebarData(): Promise<SidebarData | null> {
  try {
    const data = await getSidebarDataFn()
    return data as SidebarData | null
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return null
    }
    throw error
  }
}

export function useSidebarData() {
  return useQuery<SidebarData | null>({
    queryKey: ['sidebar'],
    queryFn: fetchSidebarData,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    staleTime: 2000,
    placeholderData: keepPreviousData,
  })
}
