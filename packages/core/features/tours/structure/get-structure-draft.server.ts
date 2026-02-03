import { and, asc, eq, inArray } from 'drizzle-orm'
import { asset } from '../../assets/schema'
import { db } from '../../db'
import { stop, stopAssetDraft, stopLocaleDraft, tour, tourStopDraft } from '../schema'

// =============================================================================
// TYPES
// =============================================================================

export type StructureDraftStop = {
  stopId: string
  stopNanoId: string
  position: number
  visible: boolean
  title: string | null
  locale: string
  thumbnailUrl: string | null
}

export type StructureDraftResult = {
  tourNanoId: string
  stops: StructureDraftStop[]
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function getStructureDraft(tourNanoId: string, locale: string): Promise<StructureDraftResult | null> {
  const [foundTour] = await db
    .select({ id: tour.id, nanoId: tour.nanoId })
    .from(tour)
    .where(eq(tour.nanoId, tourNanoId))
    .limit(1)

  if (!foundTour) return null

  const rows = await db
    .select({
      stopId: tourStopDraft.stopId,
      stopNanoId: stop.nanoId,
      position: tourStopDraft.position,
      visible: tourStopDraft.visible,
      title: stopLocaleDraft.title,
      locale: stopLocaleDraft.locale,
    })
    .from(tourStopDraft)
    .innerJoin(stop, eq(stop.id, tourStopDraft.stopId))
    .innerJoin(stopLocaleDraft, and(eq(stopLocaleDraft.stopId, stop.id), eq(stopLocaleDraft.locale, locale)))
    .where(eq(tourStopDraft.tourId, foundTour.id))
    .orderBy(asc(tourStopDraft.position))

  // Fetch first gallery image for each stop as thumbnail
  const stopIds = [...new Set(rows.map((r) => r.stopId))]
  const thumbnailByStopId = new Map<string, string>()

  if (stopIds.length > 0) {
    const galleryAssets = await db
      .select({
        stopId: stopAssetDraft.stopId,
        storagePath: asset.storagePath,
        publicUrl: asset.publicUrl,
      })
      .from(stopAssetDraft)
      .innerJoin(asset, eq(asset.id, stopAssetDraft.assetId))
      .where(
        and(
          inArray(stopAssetDraft.stopId, stopIds),
          eq(stopAssetDraft.channel, 'images.gallery'),
          eq(asset.type, 'image'),
        ),
      )
      .orderBy(asc(stopAssetDraft.position))

    for (const ga of galleryAssets) {
      if (!thumbnailByStopId.has(ga.stopId)) {
        thumbnailByStopId.set(ga.stopId, ga.storagePath || ga.publicUrl || '')
      }
    }
  }

  // Filter to requested locale, fallback to first available
  const stopsByStopId = new Map<string, StructureDraftStop>()
  for (const row of rows) {
    const existing = stopsByStopId.get(row.stopId)
    if (!existing || row.locale === locale) {
      stopsByStopId.set(row.stopId, {
        stopId: row.stopId,
        stopNanoId: row.stopNanoId,
        position: row.position,
        visible: row.visible,
        title: row.title,
        locale: row.locale,
        thumbnailUrl: thumbnailByStopId.get(row.stopId) || null,
      })
    }
  }

  // Sort by position
  const stops = Array.from(stopsByStopId.values()).sort((a, b) => a.position - b.position)

  return { tourNanoId: foundTour.nanoId, stops }
}
