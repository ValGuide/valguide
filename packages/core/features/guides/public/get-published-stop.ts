/**
 * Get a published stop by its nanoId.
 * Used by the consumer-facing app to display published stops.
 */

import { and, asc, eq, isNotNull, isNull } from 'drizzle-orm'
import { asset } from '../../assets/schema'
import { db } from '../../db'
import { stop, stopAsset, stopLocale, stopLocaleVersion } from '../schema'
import type { StopWithAssets } from './types'

// ============================================================================
// Query Function
// ============================================================================

/**
 * Get a published stop by its nanoId.
 * Returns null if the stop doesn't exist, is deleted, archived, or has no published content.
 */
export async function getPublishedStopByNanoId(nanoId: string): Promise<StopWithAssets | null> {
  // 1. Find the stop
  const stopRow = await db.query.stop.findFirst({
    where: and(eq(stop.nanoId, nanoId), isNull(stop.deletedAt), isNull(stop.archivedAt)),
  })

  if (!stopRow) return null

  // 2. Get published locale versions for the stop
  const stopLocales = await db
    .select({
      locale: stopLocale.locale,
      title: stopLocaleVersion.title,
      description: stopLocaleVersion.description,
      transcription: stopLocaleVersion.transcription,
    })
    .from(stopLocale)
    .innerJoin(stopLocaleVersion, eq(stopLocale.publishedVersionId, stopLocaleVersion.id))
    .where(and(eq(stopLocale.stopId, stopRow.id), isNotNull(stopLocale.publishedVersionId)))

  // No published locales means stop isn't published
  if (stopLocales.length === 0) return null

  // 3. Get stop assets (published)
  const stopAssetsData = await db
    .select({
      asset: asset,
      channel: stopAsset.channel,
      position: stopAsset.position,
      locale: stopAsset.locale,
    })
    .from(stopAsset)
    .innerJoin(asset, eq(stopAsset.assetId, asset.id))
    .where(eq(stopAsset.stopId, stopRow.id))
    .orderBy(asc(stopAsset.position))

  // 4. Filter availableLocales to only those with published translations
  const publishedLocales = stopLocales.map((t) => t.locale)
  const availableLocales = stopRow.availableLocales.filter((locale) => publishedLocales.includes(locale))

  return {
    id: stopRow.id,
    nanoId: stopRow.nanoId,
    organizationId: stopRow.organizationId,
    createdAt: stopRow.createdAt,
    updatedAt: stopRow.updatedAt,
    availableLocales,
    translations: stopLocales.map((t) => ({
      locale: t.locale,
      title: t.title,
      description: t.description,
      transcription: t.transcription,
    })),
    assets: stopAssetsData.map((item) => ({
      ...item.asset,
      channel: item.channel,
      position: item.position,
      locale: item.locale,
    })),
  }
}

/**
 * Alias for getPublishedStopByNanoId for backward compatibility.
 */
export async function getStopByNanoId(nanoId: string): Promise<StopWithAssets | null> {
  return getPublishedStopByNanoId(nanoId)
}
