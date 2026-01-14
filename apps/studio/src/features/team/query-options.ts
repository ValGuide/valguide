import { queryOptions } from '@tanstack/react-query'
import type { TeamData } from './api/fetchers'
import { getTeamDataFn } from './server-functions'


export const teamQueryOptions = () =>
  queryOptions<TeamData | null>({
    queryKey: ['team'],
    queryFn: async () => {
      try {
        const data = await getTeamDataFn()
        return data as TeamData | null
      } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
          throw error
        }
        throw error
      }
    },
  })
