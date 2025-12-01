import type { GuideWithStops, GuideWithTranslations } from '@valguide/core/features/guides/schema'
import type { Guide } from '@valguide/features/guides/types'

export async function fetchGuideByNanoId(url: string): Promise<GuideWithStops | null> {
  const res = await fetch(url)

  if (res.status === 401) {
    return null
  }

  if (res.status === 404) {
    return null
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch guide: ${res.statusText}`)
  }

  return res.json()
}

export async function fetchGuides(): Promise<Guide[]> {
  const res = await fetch('/api/guides')

  if (res.status === 401) {
    throw new Error('You must be logged in to view guides')
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch guides: ${res.statusText}`)
  }

  const data = await res.json()

  // Parse dates from ISO strings
  return data.map((guide: Guide & { createdAt?: string; updatedAt?: string }) => ({
    ...guide,
    createdAt: guide.createdAt ? new Date(guide.createdAt) : undefined,
    updatedAt: guide.updatedAt ? new Date(guide.updatedAt) : undefined,
  }))
}

export interface ArchivedGuidesResponse {
  guides: GuideWithTranslations[]
  userId: string
}

export async function fetchArchivedGuides(): Promise<ArchivedGuidesResponse> {
  const res = await fetch('/api/guides/archived')

  if (res.status === 401) {
    throw new Error('You must be logged in to view archived guides')
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch archived guides: ${res.statusText}`)
  }

  const data = await res.json()

  return {
    guides: data.guides.map(
      (
        guide: GuideWithTranslations & {
          createdAt?: string
          updatedAt?: string
          archivedAt?: string
          deletedAt?: string
          published?: string
        },
      ) => ({
        ...guide,
        createdAt: guide.createdAt ? new Date(guide.createdAt) : undefined,
        updatedAt: guide.updatedAt ? new Date(guide.updatedAt) : undefined,
        archivedAt: guide.archivedAt ? new Date(guide.archivedAt) : undefined,
        deletedAt: guide.deletedAt ? new Date(guide.deletedAt) : undefined,
        published: guide.published ? new Date(guide.published) : undefined,
      }),
    ),
    userId: data.userId,
  }
}
