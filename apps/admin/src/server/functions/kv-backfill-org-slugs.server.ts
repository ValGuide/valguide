import { writeOrgSlugToKv } from '@valguide/core/features/tours/public/kv'
import { getAllOrgSlugEntries } from '@valguide/core/features/tours/public/kv-backfill.server'

export type BackfillOrgSlugsResult = {
  orgsProcessed: number
  kvEntriesWritten: number
}

export async function backfillOrgSlugs(): Promise<BackfillOrgSlugsResult> {
  const entries = await getAllOrgSlugEntries()
  let kvEntriesWritten = 0

  for (const entry of entries) {
    const allSlugs = [entry.currentSlug, ...entry.historicalSlugs]
    for (const slug of allSlugs) {
      await writeOrgSlugToKv(slug, { nanoId: entry.nanoId, primarySlug: entry.currentSlug })
      kvEntriesWritten++
    }
  }

  return { orgsProcessed: entries.length, kvEntriesWritten }
}
