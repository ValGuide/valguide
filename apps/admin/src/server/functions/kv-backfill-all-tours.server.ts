import { getPublishedTourByNanoId } from '@valguide/core/features/tours/public/get-published-tour'
import { writeOrgSlugToKv, writeTourSlugToKv, writeTourToKv } from '@valguide/core/features/tours/public/kv'
import { getAllPublishedTourSummaries } from '@valguide/core/features/tours/public/kv-backfill.server'
import { serializeTourForKv } from '@valguide/core/features/tours/public/kv-serializers'

export type BackfillAllToursResult = {
  toursProcessed: number
  kvEntriesWritten: number
  errors: string[]
}

export async function backfillAllTours(): Promise<BackfillAllToursResult> {
  const summaries = await getAllPublishedTourSummaries()
  let kvEntriesWritten = 0
  const errors: string[] = []

  for (const summary of summaries) {
    try {
      const fullTour = await getPublishedTourByNanoId(summary.nanoId)
      if (!fullTour) {
        errors.push(`Tour ${summary.nanoId}: not found after summary query`)
        continue
      }

      for (const locale of fullTour.availableLocales) {
        const kvData = serializeTourForKv(fullTour, locale)
        await writeTourToKv(summary.nanoId, locale, kvData)
        kvEntriesWritten++
      }

      await writeOrgSlugToKv(summary.orgSlug, {
        nanoId: summary.orgNanoId,
        primarySlug: summary.orgSlug,
      })
      kvEntriesWritten++

      await writeTourSlugToKv(summary.orgSlug, summary.slug, {
        tourNanoId: summary.nanoId,
        primarySlug: summary.slug,
        orgPrimarySlug: summary.orgSlug,
      })
      kvEntriesWritten++
    } catch (err) {
      errors.push(`Tour ${summary.nanoId}: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  return { toursProcessed: summaries.length, kvEntriesWritten, errors }
}
