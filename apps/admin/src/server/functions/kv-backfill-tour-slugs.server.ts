import { writeTourSlugToKv } from '@valguide/core/features/tours/public/kv'
import { getAllTourSlugEntries } from '@valguide/core/features/tours/public/kv-backfill.server'

export type BackfillTourSlugsResult = {
  toursProcessed: number
  kvEntriesWritten: number
}

export async function backfillTourSlugs(): Promise<BackfillTourSlugsResult> {
  const entries = await getAllTourSlugEntries()
  let kvEntriesWritten = 0

  for (const entry of entries) {
    const allSlugs = [entry.currentSlug, ...entry.historicalSlugs]
    for (const slug of allSlugs) {
      await writeTourSlugToKv(entry.orgCurrentSlug, slug, {
        tourNanoId: entry.tourNanoId,
        primarySlug: entry.currentSlug,
        orgPrimarySlug: entry.orgCurrentSlug,
      })
      kvEntriesWritten++
    }
  }

  return { toursProcessed: entries.length, kvEntriesWritten }
}
