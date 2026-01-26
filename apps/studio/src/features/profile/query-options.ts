import { queryOptions } from '@tanstack/react-query'
import { getProfileFn } from '@valguide/core/features/profiles/get-profile.fn'
import type { Profile } from '@valguide/core/features/profiles/get-profile.server'

export const profileQueryOptions = () =>
  queryOptions<Profile | undefined>({
    queryKey: ['profile'],
    queryFn: () => getProfileFn(),
  })
