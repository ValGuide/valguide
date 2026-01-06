
import useSWR from 'swr'
import { fetchTeamData, type TeamData } from '../api/fetchers'

interface UseTeamReturn {
  data: TeamData | null
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
  isNoTeam: boolean
}

export function useTeam(): UseTeamReturn {
  const { data, error, isLoading, mutate } = useSWR<TeamData | null>('/api/team', fetchTeamData, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 2000,
    keepPreviousData: true,
  })

  const refetch = async () => {
    await mutate()
  }

  // If data is null (and not loading/error), it means the user is authenticated but has no active team
  const isNoTeam = data === null && !isLoading && !error

  return {
    data: data || null,
    isLoading,
    error: error || null,
    refetch,
    isNoTeam,
  }
}
