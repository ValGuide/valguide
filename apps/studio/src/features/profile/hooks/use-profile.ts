import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import type { Profile } from '@valguide/core/features/profiles/get-or-create-profile.fn'
import { profileQueryOptions } from '../query-options'

interface UseProfileReturn {
  profile: Profile
  refetch: () => Promise<void>
}

export function useProfile(): UseProfileReturn {
  const queryClient = useQueryClient()
  const { data } = useSuspenseQuery(profileQueryOptions())

  const refetch = async () => {
    await queryClient.invalidateQueries({ queryKey: ['profile'] })
  }

  return {
    profile: data,
    refetch,
  }
}
