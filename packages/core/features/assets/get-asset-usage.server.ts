import { eq } from 'drizzle-orm'
import { db } from '../db'
import { guide, guideAsset, guideLocaleDraft, stop, stopAsset, stopLocaleDraft } from '../guides/schema'

// =============================================================================
// TYPES
// =============================================================================

export type AssetUsageDetails = {
  guides: Array<{
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
  const guideUsage = await db
    .select({
      guideId: guide.id,
      guideNanoId: guide.nanoId,
      title: guideLocaleDraft.title,
      channel: guideAsset.channel,
      locale: guideAsset.locale,
    })
    .from(guideAsset)
    .innerJoin(guide, eq(guideAsset.guideId, guide.id))
    .leftJoin(guideLocaleDraft, eq(guideLocaleDraft.guideLocaleId, guide.id))
    .where(eq(guideAsset.assetId, assetId))

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
    .leftJoin(stopLocaleDraft, eq(stopLocaleDraft.stopLocaleId, stop.id))
    .where(eq(stopAsset.assetId, assetId))

  const uniqueGuides = new Map<string, (typeof guideUsage)[0]>()
  for (const g of guideUsage) {
    if (!uniqueGuides.has(g.guideId)) {
      uniqueGuides.set(g.guideId, g)
    }
  }

  const uniqueStops = new Map<string, (typeof stopUsage)[0]>()
  for (const s of stopUsage) {
    if (!uniqueStops.has(s.stopId)) {
      uniqueStops.set(s.stopId, s)
    }
  }

  return {
    guides: Array.from(uniqueGuides.values()).map((g) => ({
      id: g.guideId,
      nanoId: g.guideNanoId,
      name: g.title ?? 'Untitled',
      channel: g.channel,
      locale: g.locale,
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
