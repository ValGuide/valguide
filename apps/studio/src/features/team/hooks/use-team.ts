import { useSuspenseQuery } from '@tanstack/react-query'
import type { TeamData } from '@valguide/core/features/orgs/types'
import { teamQueryOptions } from '../query-options'

interface UseTeamReturn {
  data: TeamData
  refetch: () => Promise<void>
}

export function useTeam(): UseTeamReturn {
  const { data, refetch: queryRefetch } = useSuspenseQuery(teamQueryOptions())

  if (!data) {
    throw new Error('Team data is required but not available')
  }

  const refetch = async () => {
    await queryRefetch()
  }

  return {
    data,
    refetch,
  }
}
