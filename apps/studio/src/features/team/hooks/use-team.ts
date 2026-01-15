import { useQuery } from '@tanstack/react-query'
import { teamQueryOptions } from '../query-options'
import type { TeamData } from '../server-functions'

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
