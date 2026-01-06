import type { StopWithTranslations } from '@valguide/core/features/guides/schema'

export type StopWithGuides = StopWithTranslations & {
  guideStops: Array<{
    guide: {
      id: string
      nanoId: string
      translations: Array<{
        locale: string
        currentVersion?: {
          title: string
        } | null
      }>
    }
  }>
}

export async function fetchStops(): Promise<StopWithGuides[]> {
  const res = await fetch('/api/stops')

  if (res.status === 401) {
    throw new Error('You must be logged in to view stops')
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch stops: ${res.statusText}`)
  }

  const data = await res.json()

  return data.map((stop: StopWithGuides & { createdAt?: string; updatedAt?: string }) => ({
    ...stop,
    createdAt: stop.createdAt ? new Date(stop.createdAt) : undefined,
    updatedAt: stop.updatedAt ? new Date(stop.updatedAt) : undefined,
  }))
}
