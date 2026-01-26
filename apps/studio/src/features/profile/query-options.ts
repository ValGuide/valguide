import { queryOptions } from '@tanstack/react-query'
import type { Profile } from '@valguide/core/features/profiles/get-profile.fn'
import { getProfileFn } from '@valguide/core/features/profiles/get-profile.fn'

export const profileQueryOptions = () =>
  queryOptions<Profile | undefined>({
    queryKey: ['profile'],
    queryFn: () => getProfileFn(),
  })
