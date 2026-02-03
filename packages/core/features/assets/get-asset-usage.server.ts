import { and, eq } from 'drizzle-orm'
import { db } from '../db'
import { tour, tourAsset, tourLocaleDraft, stop, stopAsset, stopLocaleDraft } from '../tours/schema'

// =============================================================================
// TYPES
// =============================================================================

export type AssetUsageDetails = {
  tours: Array<{
    id: string
    nanoId: string
    name: string
    channel: string
    locale: string | null
  }>
  stops: Array<{
    id: string
    nanoId: string
    name: string
    channel: string
    locale: string | null
  }>
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function getAssetUsage(assetId: string): Promise<AssetUsageDetails> {
  const tourUsage = await db
    .select({
      tourId: tour.id,
      tourNanoId: tour.nanoId,
      title: tourLocaleDraft.title,
      channel: tourAsset.channel,
      locale: tourAsset.locale,
    })
    .from(tourAsset)
    .innerJoin(tour, eq(tourAsset.tourId, tour.id))
    .leftJoin(tourLocaleDraft, and(eq(tourLocaleDraft.tourId, tour.id), eq(tourLocaleDraft.locale, 'en')))
    .where(eq(tourAsset.assetId, assetId))

  const stopUsage = await db
    .select({
      stopId: stop.id,
      stopNanoId: stop.nanoId,
      title: stopLocaleDraft.title,
      channel: stopAsset.channel,
      locale: stopAsset.locale,
    })
    .from(stopAsset)
    .innerJoin(stop, eq(stopAsset.stopId, stop.id))
    .leftJoin(stopLocaleDraft, and(eq(stopLocaleDraft.stopId, stop.id), eq(stopLocaleDraft.locale, 'en')))
    .where(eq(stopAsset.assetId, assetId))

  const uniqueTours = new Map<string, (typeof tourUsage)[0]>()
  for (const t of tourUsage) {
    if (!uniqueTours.has(t.tourId)) {
      uniqueTours.set(t.tourId, t)
    }
  }

  const uniqueStops = new Map<string, (typeof stopUsage)[0]>()
  for (const s of stopUsage) {
    if (!uniqueStops.has(s.stopId)) {
      uniqueStops.set(s.stopId, s)
    }
  }

  return {
    tours: Array.from(uniqueTours.values()).map((t) => ({
      id: t.tourId,
      nanoId: t.tourNanoId,
      name: t.title ?? 'Untitled',
      channel: t.channel,
      locale: t.locale,
    })),
    stops: Array.from(uniqueStops.values()).map((s) => ({
      id: s.stopId,
      nanoId: s.stopNanoId,
      name: s.title ?? 'Untitled',
      channel: s.channel,
      locale: s.locale,
    })),
  }
}
