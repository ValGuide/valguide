import { getPublishedTourByNanoId } from '@valguide/core/features/tours/public/get-published-tour'
import {
  getOrgSlugEntriesForOrg,
  getTourSlugEntriesForTour,
} from '@valguide/core/features/tours/public/kv-backfill.server'
import { writeOrgSlugToKv, writeTourSlugToKv, writeTourToKv } from '@valguide/core/features/tours/public/kv-helpers'
import { serializeTourForKv } from '@valguide/core/features/tours/public/kv-serializers'

export type BackfillTourResult = {
  localesWritten: number
  slugsWritten: number
  errors: string[]
}

export async function backfillTour(tourNanoId: string): Promise<BackfillTourResult> {
  const errors: string[] = []
  let localesWritten = 0
  let slugsWritten = 0

  const fullTour = await getPublishedTourByNanoId(tourNanoId)
  if (!fullTour) {
    return { localesWritten: 0, slugsWritten: 0, errors: ['Tour not found or not published'] }
  }

  for (const locale of fullTour.availableLocales) {
    try {
      const kvData = serializeTourForKv(fullTour, locale)
      await writeTourToKv(tourNanoId, locale, kvData)
      localesWritten++
    } catch (err) {
      errors.push(`Locale ${locale}: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const tourSlugEntry = await getTourSlugEntriesForTour(tourNanoId)
  if (tourSlugEntry) {
    const allTourSlugs = [tourSlugEntry.currentSlug, ...tourSlugEntry.historicalSlugs]
    for (const slug of allTourSlugs) {
      try {
        await writeTourSlugToKv(tourSlugEntry.orgCurrentSlug, slug, {
          tourNanoId,
          primarySlug: tourSlugEntry.currentSlug,
          orgPrimarySlug: tourSlugEntry.orgCurrentSlug,
        })
        slugsWritten++
      } catch (err) {
        errors.push(`Tour slug ${slug}: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }
    }

    const orgSlugEntry = await getOrgSlugEntriesForOrg(tourSlugEntry.orgNanoId)
    if (orgSlugEntry) {
      const allOrgSlugs = [orgSlugEntry.currentSlug, ...orgSlugEntry.historicalSlugs]
      for (const slug of allOrgSlugs) {
        try {
          await writeOrgSlugToKv(slug, { nanoId: orgSlugEntry.nanoId, primarySlug: orgSlugEntry.currentSlug })
          slugsWritten++
        } catch (err) {
          errors.push(`Org slug ${slug}: ${err instanceof Error ? err.message : 'Unknown error'}`)
        }
      }
    }
  }

  return { localesWritten, slugsWritten, errors }
}
