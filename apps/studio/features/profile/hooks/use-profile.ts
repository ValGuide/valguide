'use client'

import useSWR from 'swr'
import { Profile } from '@valguide/features/profiles/types'
import { fetchProfile } from '../api/fetchers'

interface UseProfileReturn {
  profile: Profile | null | undefined
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useProfile(): UseProfileReturn {
  const { data, error, isLoading, mutate } = useSWR<Profile | null>('/api/profile', fetchProfile, {
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
    error: error || null,
    refetch,
  }
}
