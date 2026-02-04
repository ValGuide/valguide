import { queryOptions } from '@tanstack/react-query'
import type { Profile } from '@valguide/core/features/profiles/get-or-create-profile.fn'
import { getOrCreateProfileFn } from '@valguide/core/features/profiles/get-or-create-profile.fn'

export const profileQueryOptions = () =>
  queryOptions<Profile>({
    queryKey: ['profile'],
    queryFn: () => getOrCreateProfileFn(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
