/**
 * Get a published tour by its nanoId.
 * Used by the consumer-facing app to display published tours.
 */

import { and, asc, eq, inArray, isNull } from 'drizzle-orm'
import { asset } from '../../assets/schema'
import { db } from '../../db'
import { resolveEffectiveTheme } from '../../themes/resolve-effective-theme.server'
import type { ThemeConfig } from '../../themes/types'
import { stop, stopAsset, stopLocale, tour, tourAsset, tourLocale, tourSettings, tourStop } from '../schema'
import type { AssetItem, PublishedStopTranslation, StopWithAssets, TourWithStopsAndAssets } from './types'

// ============================================================================
// Query Function
// ============================================================================

/**
 * Get a published tour by its nanoId.
 * Returns null if the tour doesn't exist, is deleted, archived, or has no published content.
 */
export async function getPublishedTourByNanoId(nanoId: string): Promise<TourWithStopsAndAssets | null> {
  // 1. Find the tour
  const tourRow = await db.query.tour.findFirst({
    where: and(eq(tour.nanoId, nanoId), isNull(tour.deletedAt), isNull(tour.archivedAt)),
  })

  if (!tourRow) return null

  // 2. Get published locales for the tour (tourLocale IS the live/published table)
  const tourLocales = await db
    .select({
      locale: tourLocale.locale,
      title: tourLocale.title,
      description: tourLocale.description,
    })
    .from(tourLocale)
    .where(eq(tourLocale.tourId, tourRow.id))

  // No published locales means tour isn't published
  if (tourLocales.length === 0) return null

  // 3. Get published structure (stops)
  const publishedStops = await db
    .select({
      stopId: tourStop.stopId,
      position: tourStop.position,
      visible: tourStop.visible,
    })
    .from(tourStop)
    .where(and(eq(tourStop.tourId, tourRow.id), eq(tourStop.visible, true)))
    .orderBy(asc(tourStop.position))

  const stopIds = publishedStops.map((s) => s.stopId)

  // 4. Get stop details
  const stopsData =
    stopIds.length > 0
      ? await db.query.stop.findMany({
          where: and(inArray(stop.id, stopIds), isNull(stop.deletedAt), isNull(stop.archivedAt)),
        })
      : []

  // 5. Get published translations for each stop (stopLocale IS the live/published table)
  const stopTranslationsData =
    stopIds.length > 0
      ? await db
          .select({
            stopId: stopLocale.stopId,
            locale: stopLocale.locale,
            title: stopLocale.title,
            description: stopLocale.description,
            transcription: stopLocale.transcription,
          })
          .from(stopLocale)
          .where(inArray(stopLocale.stopId, stopIds))
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

  // 6. Get tour assets (published)
  const tourAssetsData = await db
    .select({
      asset: asset,
      channel: tourAsset.channel,
      position: tourAsset.position,
      locale: tourAsset.locale,
    })
    .from(tourAsset)
    .innerJoin(asset, eq(tourAsset.assetId, asset.id))
    .where(eq(tourAsset.tourId, tourRow.id))
    .orderBy(asc(tourAsset.position))

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
  const publishedLocales = tourLocales.map((t) => t.locale)
  const availableLocales = tourRow.availableLocales.filter((locale) => publishedLocales.includes(locale))

  // 10. Get tour theme from published settings
  const settings = await db.query.tourSettings.findFirst({
    where: eq(tourSettings.tourId, tourRow.id),
  })
  const resolvedTheme = await resolveEffectiveTheme({
    organizationId: tourRow.organizationId,
    assignedThemeId: settings?.themeId ?? null,
  })
  const themeConfig: ThemeConfig | null = resolvedTheme?.config ?? null

  return {
    id: tourRow.id,
    nanoId: tourRow.nanoId,
    organizationId: tourRow.organizationId,
    createdAt: tourRow.createdAt,
    updatedAt: tourRow.updatedAt,
    availableLocales,
    translations: tourLocales.map((t) => ({
      locale: t.locale,
      title: t.title,
      description: t.description,
    })),
    assets: tourAssetsData.map((item) => ({
      ...item.asset,
      channel: item.channel,
      position: item.position,
      locale: item.locale,
    })),
    stops,
    theme: themeConfig,
  }
}
