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
  thumbnailUrl: string | null
}

export type StructureDraftResult = {
  tourNanoId: string
  stops: StructureDraftStop[]
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function getStructureDraft(
  tourNanoId: string,
  preferredLocale?: string,
): Promise<StructureDraftResult | null> {
  const [foundTour] = await db
    .select({ id: tour.id, nanoId: tour.nanoId, availableLocales: tour.availableLocales })
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
    })
    .from(tourStopDraft)
    .innerJoin(stop, eq(stop.id, tourStopDraft.stopId))
    .where(eq(tourStopDraft.tourId, foundTour.id))
    .orderBy(asc(tourStopDraft.position))

  const stopIds = [...new Set(rows.map((r) => r.stopId))]

  const thumbnailByStopId = new Map<string, string>()
  const titleByStopId = new Map<string, string>()

  if (stopIds.length > 0) {
    const galleryAssets = await db
      .select({
        stopId: stopAssetDraft.stopId,
        storagePath: asset.storagePath,
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
        thumbnailByStopId.set(ga.stopId, ga.storagePath)
      }
    }

    const localeDrafts = await db
      .select({
        stopId: stopLocaleDraft.stopId,
        locale: stopLocaleDraft.locale,
        title: stopLocaleDraft.title,
      })
      .from(stopLocaleDraft)
      .where(inArray(stopLocaleDraft.stopId, stopIds))

    const targetLocale = preferredLocale ?? foundTour.availableLocales?.[0] ?? 'en'
    for (const ld of localeDrafts) {
      if (!ld.title?.trim()) continue
      const existing = titleByStopId.get(ld.stopId)
      if (!existing || ld.locale === targetLocale) {
        titleByStopId.set(ld.stopId, ld.title.trim())
      }
    }
  }

  const stops: StructureDraftStop[] = rows.map((row) => ({
    stopId: row.stopId,
    stopNanoId: row.stopNanoId,
    position: row.position,
    visible: row.visible,
    title: titleByStopId.get(row.stopId) ?? null,
    thumbnailUrl: thumbnailByStopId.get(row.stopId) ?? null,
  }))

  return { tourNanoId: foundTour.nanoId, stops }
}
