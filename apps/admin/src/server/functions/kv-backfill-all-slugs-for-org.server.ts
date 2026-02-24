import { writeOrgSlugToKv, writeTourSlugToKv } from '@valguide/core/features/tours/public/kv'
import {
  getOrgSlugEntriesForOrg,
  getTourSlugEntriesForOrg,
} from '@valguide/core/features/tours/public/kv-backfill.server'

export type BackfillAllSlugsForOrgResult = {
  orgSlugEntriesWritten: number
  tourSlugsProcessed: number
  tourSlugEntriesWritten: number
}

export async function backfillAllSlugsForOrg(orgNanoId: string): Promise<BackfillAllSlugsForOrgResult> {
  let orgSlugEntriesWritten = 0
  let tourSlugEntriesWritten = 0

  const orgEntry = await getOrgSlugEntriesForOrg(orgNanoId)
  if (!orgEntry) {
    throw new Error(`Organization not found: ${orgNanoId}`)
  }

  const allOrgSlugs = [orgEntry.currentSlug, ...orgEntry.historicalSlugs]
  for (const slug of allOrgSlugs) {
    await writeOrgSlugToKv(slug, { nanoId: orgEntry.nanoId, primarySlug: orgEntry.currentSlug })
    orgSlugEntriesWritten++
  }

  const tourEntries = await getTourSlugEntriesForOrg(orgNanoId)
  for (const entry of tourEntries) {
    const allSlugs = [entry.currentSlug, ...entry.historicalSlugs]
    for (const slug of allSlugs) {
      await writeTourSlugToKv(entry.orgCurrentSlug, slug, {
        tourNanoId: entry.tourNanoId,
        primarySlug: entry.currentSlug,
        orgPrimarySlug: entry.orgCurrentSlug,
      })
      tourSlugEntriesWritten++
    }
  }

  return {
    orgSlugEntriesWritten,
    tourSlugsProcessed: tourEntries.length,
    tourSlugEntriesWritten,
  }
}
