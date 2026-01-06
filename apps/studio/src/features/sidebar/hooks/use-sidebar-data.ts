import useSWR from 'swr'
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
  return useSWR<SidebarData | null>('sidebar', fetchSidebarData, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 2000,
    keepPreviousData: true,
  })
}
