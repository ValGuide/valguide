import { queryOptions } from '@tanstack/react-query'
import type { TeamData } from '@valguide/core/features/orgs/get-team-data.fn'
import { getTeamDataFn } from '@valguide/core/features/orgs/get-team-data.fn'

export const teamQueryOptions = () =>
  queryOptions<TeamData | null>({
    queryKey: ['team'],
    queryFn: () => getTeamDataFn({ data: {} }),
    staleTime: 30 * 1000,
  })
