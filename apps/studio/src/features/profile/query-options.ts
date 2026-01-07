import { queryOptions } from '@tanstack/react-query'
import type { Profile } from '@valguide/features/profiles/types'
import { getProfileFn } from './server-functions'

export const profileQueryOptions = () =>
  queryOptions<Profile | null>({
    queryKey: ['profile'],
    queryFn: async () => {
      try {
        const profile = await getProfileFn()
        return profile
      } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
          throw new Error('You must be logged in to view profile')
        }
        throw error
      }
    },
  })
