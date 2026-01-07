import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { TeamData } from '../api/fetchers'
import { getTeamDataFn } from '../server-functions'

interface UseTeamReturn {
  data: TeamData | null
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
  isNoTeam: boolean
}

async function fetchTeamData(): Promise<TeamData | null> {
  try {
    const data = await getTeamDataFn()
    return data as TeamData | null
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      throw error
    }
    throw error
  }
}

export function useTeam(): UseTeamReturn {
  const {
    data,
    error,
    isLoading,
    refetch: queryRefetch,
  } = useQuery<TeamData | null>({
    queryKey: ['team'],
    queryFn: fetchTeamData,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    staleTime: 2000,
    placeholderData: keepPreviousData,
  })

  const refetch = async () => {
    await queryRefetch()
  }

  const isNoTeam = data === null && !isLoading && !error

  return {
    data: data ?? null,
    isLoading,
    error: error ?? null,
    refetch,
    isNoTeam,
  }
}
