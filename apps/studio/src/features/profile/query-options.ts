import { queryOptions } from '@tanstack/react-query'
import { getProfileFn, type Profile } from '@valguide/core/features/profiles/get-profile.fn'

export const profileQueryOptions = () =>
  queryOptions<Profile | undefined>({
    queryKey: ['profile'],
    queryFn: () => getProfileFn(),
  })
