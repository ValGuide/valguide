import { queryOptions } from '@tanstack/react-query'
import { getTeamDataFn, type TeamData } from '@valguide/core/features/orgs/get-team-data'

export const teamQueryOptions = () =>
  queryOptions<TeamData | null>({
    queryKey: ['team'],
    queryFn: () => getTeamDataFn({ data: {} }),
    staleTime: 30 * 1000,
  })
