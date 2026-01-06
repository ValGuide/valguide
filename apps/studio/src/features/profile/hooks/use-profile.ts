import type { Profile } from '@valguide/features/profiles/types'
import useSWR from 'swr'
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
  const { data, error, isLoading, mutate } = useSWR<Profile | null>('profile', fetchProfile, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 2000,
    keepPreviousData: true,
  })

  const refetch = async () => {
    await mutate()
  }

  return {
    profile: data,
    isLoading,
    error: error ?? null,
    refetch,
  }
}
