import { queryOptions } from '@tanstack/react-query'
import type { StopWithGuides } from './api/fetchers'
import { getStopsFn } from './server-functions'

export const stopsQueryOptions = () =>
  queryOptions<StopWithGuides[]>({
    queryKey: ['stops'],
    queryFn: async () => {
      try {
        const data = await getStopsFn({ data: {} })
        return data as StopWithGuides[]
      } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
          throw new Error('You must be logged in to view stops')
        }
        throw error
      }
    },
  })
