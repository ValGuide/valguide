import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Profile } from '@valguide/features/profiles/types'
import { getProfileFn } from '../server-functions'

interface UseProfileReturn {
  profile: Profile | null | undefined
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

async function fetchProfile(): Promise<Profile | null> {
  try {
    const profile = await getProfileFn()
    return profile
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      throw new Error('You must be logged in to view profile')
    }
    throw error
  }
}

export function useProfile(): UseProfileReturn {
  const queryClient = useQueryClient()
  const { data, error, isLoading } = useQuery<Profile | null>({
    queryKey: ['profile'],
    queryFn: fetchProfile,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    staleTime: 2000,
    placeholderData: keepPreviousData,
  })

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
