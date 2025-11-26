import { Profile } from '@valguide/features/profiles/types'

export async function fetchProfile(): Promise<Profile | null> {
  const res = await fetch('/api/profile')

  if (res.status === 401) {
    throw new Error('You must be logged in to view profile')
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch profile: ${res.statusText}`)
  }

  const data = await res.json()

  if (!data) return data

  return {
    ...data,
    createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
    updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
    onboardedAt: data.onboardedAt ? new Date(data.onboardedAt) : undefined,
  }
}
