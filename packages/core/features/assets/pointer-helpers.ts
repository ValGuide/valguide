import { type DB, db as defaultDb } from '@valguide/core/features/db'
import { inArray } from 'drizzle-orm'
import { guideAsset, stopAsset } from './schema'

export type VersionPointer = {
  currentVersionId: string | null
  draftVersionId: string | null
}

/**
 * Get asset version pointers for multiple guides.
 * Returns a map of guideId → { currentVersionId, draftVersionId }
 */
export async function getGuideAssetPointers(
  guideIds: string[],
  database: DB = defaultDb,
): Promise<Map<string, VersionPointer>> {
  if (guideIds.length === 0) return new Map()

  const rows = await database
    .select({
      guideId: guideAsset.guideId,
      currentVersionId: guideAsset.currentVersionId,
      draftVersionId: guideAsset.draftVersionId,
    })
    .from(guideAsset)
    .where(inArray(guideAsset.guideId, guideIds))

  return new Map(
    rows.map((r) => [r.guideId, { currentVersionId: r.currentVersionId, draftVersionId: r.draftVersionId }]),
  )
}

/**
 * Get asset version pointers for multiple stops.
 * Returns a map of stopId → { currentVersionId, draftVersionId }
 */
export async function getStopAssetPointers(
  stopIds: string[],
  database: DB = defaultDb,
): Promise<Map<string, VersionPointer>> {
  if (stopIds.length === 0) return new Map()

  const rows = await database
    .select({
      stopId: stopAsset.stopId,
      currentVersionId: stopAsset.currentVersionId,
      draftVersionId: stopAsset.draftVersionId,
    })
    .from(stopAsset)
    .where(inArray(stopAsset.stopId, stopIds))

  return new Map(
    rows.map((r) => [r.stopId, { currentVersionId: r.currentVersionId, draftVersionId: r.draftVersionId }]),
  )
}

/**
 * Get the active version ID (draft preferred, fallback to current).
 * Use for editor contexts where you want to show draft changes.
 */
export function getActiveVersionId(pointer: VersionPointer | undefined): string | null {
  return pointer?.draftVersionId ?? pointer?.currentVersionId ?? null
}

/**
 * Get the published version ID only.
 * Use for public-facing contexts where only published content should be shown.
 */
export function getPublishedVersionId(pointer: VersionPointer | undefined): string | null {
  return pointer?.currentVersionId ?? null
}
