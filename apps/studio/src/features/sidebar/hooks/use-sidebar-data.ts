import { useQuery } from '@tanstack/react-query'
import { sidebarQueryOptions } from '../query-options'

export function useSidebarData() {
  return useQuery(sidebarQueryOptions())
}
