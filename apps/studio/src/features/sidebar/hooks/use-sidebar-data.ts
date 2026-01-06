import useSWR from 'swr'
import { fetchSidebarData, type SidebarData } from '../api/fetchers'

export function useSidebarData() {
  return useSWR<SidebarData | null>('/api/sidebar', fetchSidebarData, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 2000,
    keepPreviousData: true,
  })
}
