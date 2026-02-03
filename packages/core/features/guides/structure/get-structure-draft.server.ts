import { and, asc, eq, inArray } from 'drizzle-orm'
import { asset } from '../../assets/schema'
import { db } from '../../db'
import { guide, guideStopDraft, stop, stopAssetDraft, stopLocaleDraft } from '../schema'

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
  guideNanoId: string
  stops: StructureDraftStop[]
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function getStructureDraft(guideNanoId: string, locale: string): Promise<StructureDraftResult | null> {
  const [foundGuide] = await db
    .select({ id: guide.id, nanoId: guide.nanoId })
    .from(guide)
    .where(eq(guide.nanoId, guideNanoId))
    .limit(1)

  if (!foundGuide) return null

  const rows = await db
    .select({
      stopId: guideStopDraft.stopId,
      stopNanoId: stop.nanoId,
      position: guideStopDraft.position,
      visible: guideStopDraft.visible,
      title: stopLocaleDraft.title,
      locale: stopLocaleDraft.locale,
    })
    .from(guideStopDraft)
    .innerJoin(stop, eq(stop.id, guideStopDraft.stopId))
    .innerJoin(stopLocaleDraft, and(eq(stopLocaleDraft.stopId, stop.id), eq(stopLocaleDraft.locale, locale)))
    .where(eq(guideStopDraft.guideId, foundGuide.id))
    .orderBy(asc(guideStopDraft.position))

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

  return { guideNanoId: foundGuide.nanoId, stops }
}
