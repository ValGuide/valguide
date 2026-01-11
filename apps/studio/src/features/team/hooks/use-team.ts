import { useQuery } from '@tanstack/react-query'
import type { TeamData } from '../api/fetchers'
import { teamQueryOptions } from '../query-options'

interface UseTeamReturn {
  data: TeamData | null
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useTeam(): UseTeamReturn {
  const { data, error, isLoading, refetch: queryRefetch } = useQuery(teamQueryOptions())

  const refetch = async () => {
    await queryRefetch()
  }

  return {
    data: data ?? null,
    isLoading,
    error: error ?? null,
    refetch,
  }
}
