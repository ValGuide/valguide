import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { Profile } from '@valguide/features/profiles/types'
import { profileQueryOptions } from '../query-options'

interface UseProfileReturn {
  profile: Profile | null | undefined
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useProfile(): UseProfileReturn {
  const queryClient = useQueryClient()
  const { data, error, isLoading } = useQuery(profileQueryOptions())

  const refetch = async () => {
    await queryClient.invalidateQueries({ queryKey: ['profile'] })
  }

  return {
    profile: data,
    isLoading,
    error: error ?? null,
    refetch,
  }
}
