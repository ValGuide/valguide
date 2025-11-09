import { Guide } from '@valguide/features/guides/types'

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
  return data.map((guide: any) => ({
    ...guide,
    createdAt: guide.createdAt ? new Date(guide.createdAt) : undefined,
    updatedAt: guide.updatedAt ? new Date(guide.updatedAt) : undefined,
  }))
}
