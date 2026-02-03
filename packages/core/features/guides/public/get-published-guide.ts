/**
 * Get a published guide by its nanoId.
 * Used by the consumer-facing app to display published guides.
 */

import { and, asc, eq, inArray, isNotNull, isNull } from 'drizzle-orm'
import { asset } from '../../assets/schema'
import { db } from '../../db'
import { theme as themeTable } from '../../themes/schema'
import type { ThemeConfig } from '../../themes/types'
import {
  guide,
  guideAsset,
  guideLocale,
  guideLocaleVersion,
  guideSettings,
  guideStop,
  stop,
  stopAsset,
  stopLocale,
  stopLocaleVersion,
} from '../schema'
import type { AssetItem, GuideWithStopsAndAssets, PublishedStopTranslation, StopWithAssets } from './types'

// ============================================================================
// Query Function
// ============================================================================

/**
 * Get a published guide by its nanoId.
 * Returns null if the guide doesn't exist, is deleted, archived, or has no published content.
 */
export async function getPublishedGuideByNanoId(nanoId: string): Promise<GuideWithStopsAndAssets | null> {
  // 1. Find the guide
  const guideRow = await db.query.guide.findFirst({
    where: and(eq(guide.nanoId, nanoId), isNull(guide.deletedAt), isNull(guide.archivedAt)),
  })

  if (!guideRow) return null

  // 2. Get published locale versions for the guide
  const guideLocales = await db
    .select({
      locale: guideLocale.locale,
      title: guideLocaleVersion.title,
      description: guideLocaleVersion.description,
    })
    .from(guideLocale)
    .innerJoin(guideLocaleVersion, eq(guideLocale.publishedVersionId, guideLocaleVersion.id))
    .where(and(eq(guideLocale.guideId, guideRow.id), isNotNull(guideLocale.publishedVersionId)))

  // No published locales means guide isn't published
  if (guideLocales.length === 0) return null

  // 3. Get published structure (stops)
  const publishedStops = await db
    .select({
      stopId: guideStop.stopId,
      position: guideStop.position,
      visible: guideStop.visible,
    })
    .from(guideStop)
    .where(and(eq(guideStop.guideId, guideRow.id), eq(guideStop.visible, true)))
    .orderBy(asc(guideStop.position))

  const stopIds = publishedStops.map((s) => s.stopId)

  // 4. Get stop details
  const stopsData =
    stopIds.length > 0
      ? await db.query.stop.findMany({
          where: and(inArray(stop.id, stopIds), isNull(stop.deletedAt), isNull(stop.archivedAt)),
        })
      : []

  // 5. Get published translations for each stop
  const stopTranslationsData =
    stopIds.length > 0
      ? await db
          .select({
            stopId: stopLocale.stopId,
            locale: stopLocale.locale,
            title: stopLocaleVersion.title,
            description: stopLocaleVersion.description,
            transcription: stopLocaleVersion.transcription,
          })
          .from(stopLocale)
          .innerJoin(stopLocaleVersion, eq(stopLocale.publishedVersionId, stopLocaleVersion.id))
          .where(and(inArray(stopLocale.stopId, stopIds), isNotNull(stopLocale.publishedVersionId)))
      : []

  // Group stop translations by stop ID
  const stopTranslationsMap = new Map<string, PublishedStopTranslation[]>()
  for (const t of stopTranslationsData) {
    if (!stopTranslationsMap.has(t.stopId)) {
      stopTranslationsMap.set(t.stopId, [])
    }
    stopTranslationsMap.get(t.stopId)?.push({
      locale: t.locale,
      title: t.title,
      description: t.description,
      transcription: t.transcription,
    })
  }

  // 6. Get guide assets (published)
  const guideAssetsData = await db
    .select({
      asset: asset,
      channel: guideAsset.channel,
      position: guideAsset.position,
      locale: guideAsset.locale,
    })
    .from(guideAsset)
    .innerJoin(asset, eq(guideAsset.assetId, asset.id))
    .where(eq(guideAsset.guideId, guideRow.id))
    .orderBy(asc(guideAsset.position))

  // 7. Get stop assets (published)
  const stopAssetsData =
    stopIds.length > 0
      ? await db
          .select({
            stopId: stopAsset.stopId,
            asset: asset,
            channel: stopAsset.channel,
            position: stopAsset.position,
            locale: stopAsset.locale,
          })
          .from(stopAsset)
          .innerJoin(asset, eq(stopAsset.assetId, asset.id))
          .where(inArray(stopAsset.stopId, stopIds))
          .orderBy(asc(stopAsset.position))
      : []

  // Group stop assets by stop ID
  const stopAssetsMap = new Map<string, AssetItem[]>()
  for (const item of stopAssetsData) {
    if (!stopAssetsMap.has(item.stopId)) {
      stopAssetsMap.set(item.stopId, [])
    }
    stopAssetsMap.get(item.stopId)?.push({
      ...item.asset,
      channel: item.channel,
      position: item.position,
      locale: item.locale,
    })
  }

  // 8. Build stops with translations and assets
  const stopsMap = new Map(stopsData.map((s) => [s.id, s]))
  const stops: StopWithAssets[] = publishedStops
    .map((ps) => {
      const stopData = stopsMap.get(ps.stopId)
      if (!stopData) return null
      return {
        id: stopData.id,
        nanoId: stopData.nanoId,
        organizationId: stopData.organizationId,
        createdAt: stopData.createdAt,
        updatedAt: stopData.updatedAt,
        availableLocales: stopData.availableLocales,
        translations: stopTranslationsMap.get(stopData.id) ?? [],
        assets: stopAssetsMap.get(stopData.id) ?? [],
      }
    })
    .filter((s): s is StopWithAssets => s !== null)

  // 9. Filter availableLocales to only those with published translations
  const publishedLocales = guideLocales.map((t) => t.locale)
  const availableLocales = guideRow.availableLocales.filter((locale) => publishedLocales.includes(locale))

  // 10. Get guide theme from published settings
  let themeConfig: ThemeConfig | null = null
  const settings = await db.query.guideSettings.findFirst({
    where: eq(guideSettings.guideId, guideRow.id),
  })

  if (settings?.themeId) {
    const themeRow = await db.query.theme.findFirst({
      where: eq(themeTable.id, settings.themeId),
    })

    if (themeRow) {
      themeConfig = {
        basePreset: themeRow.basePreset,
        colors: themeRow.colors,
        radius: Number(themeRow.radius),
        fonts: themeRow.fonts,
      }
    }
  }

  return {
    id: guideRow.id,
    nanoId: guideRow.nanoId,
    organizationId: guideRow.organizationId,
    createdAt: guideRow.createdAt,
    updatedAt: guideRow.updatedAt,
    availableLocales,
    translations: guideLocales.map((t) => ({
      locale: t.locale,
      title: t.title,
      description: t.description,
    })),
    assets: guideAssetsData.map((item) => ({
      ...item.asset,
      channel: item.channel,
      position: item.position,
      locale: item.locale,
    })),
    stops,
    theme: themeConfig,
  }
}
