/**
 * Get a draft tour by its nanoId.
 * Used by the consumer-facing app to preview unpublished draft content.
 * Mirrors getPublishedTourByNanoId() but reads from draft tables.
 */

import { and, asc, eq, inArray, isNull } from 'drizzle-orm'
import { asset } from '../../assets/schema'
import { db } from '../../db'
import { theme as themeTable } from '../../themes/schema'
import type { ThemeConfig } from '../../themes/types'
import {
  stop,
  stopAsset,
  stopAssetDraft,
  stopLocaleDraft,
  tour,
  tourAsset,
  tourAssetDraft,
  tourLocaleDraft,
  tourSettings,
  tourSettingsDraft,
  tourStop,
  tourStopDraft,
} from '../schema'
import type { AssetItem, PublishedStopTranslation, StopWithAssets, TourWithStopsAndAssets } from './types'

/**
 * Get a draft tour by its nanoId for preview mode.
 * Returns null if the tour doesn't exist, is deleted, or archived.
 * Uses draft tables for locale, structure, assets, and settings.
 * Falls back to published structure/settings when no draft exists.
 */
export async function getDraftTourByNanoId(nanoId: string): Promise<TourWithStopsAndAssets | null> {
  // 1. Find the tour
  const tourRow = await db.query.tour.findFirst({
    where: and(eq(tour.nanoId, nanoId), isNull(tour.deletedAt), isNull(tour.archivedAt)),
  })

  if (!tourRow) return null

  // 2. Get draft locales for the tour
  const tourLocales = await db
    .select({
      locale: tourLocaleDraft.locale,
      title: tourLocaleDraft.title,
      description: tourLocaleDraft.description,
    })
    .from(tourLocaleDraft)
    .where(eq(tourLocaleDraft.tourId, tourRow.id))

  // No draft locales means nothing to preview
  if (tourLocales.length === 0) return null

  // 3. Get draft structure (stops) — fall back to published if no draft structure
  let structureStops = await db
    .select({
      stopId: tourStopDraft.stopId,
      position: tourStopDraft.position,
      visible: tourStopDraft.visible,
    })
    .from(tourStopDraft)
    .where(and(eq(tourStopDraft.tourId, tourRow.id), eq(tourStopDraft.visible, true)))
    .orderBy(asc(tourStopDraft.position))

  if (structureStops.length === 0) {
    structureStops = await db
      .select({
        stopId: tourStop.stopId,
        position: tourStop.position,
        visible: tourStop.visible,
      })
      .from(tourStop)
      .where(and(eq(tourStop.tourId, tourRow.id), eq(tourStop.visible, true)))
      .orderBy(asc(tourStop.position))
  }

  const stopIds = structureStops.map((s) => s.stopId)

  // 4. Get stop details
  const stopsData =
    stopIds.length > 0
      ? await db.query.stop.findMany({
          where: and(inArray(stop.id, stopIds), isNull(stop.deletedAt), isNull(stop.archivedAt)),
        })
      : []

  // 5. Get draft translations for each stop
  const stopTranslationsData =
    stopIds.length > 0
      ? await db
          .select({
            stopId: stopLocaleDraft.stopId,
            locale: stopLocaleDraft.locale,
            title: stopLocaleDraft.title,
            description: stopLocaleDraft.description,
            transcription: stopLocaleDraft.transcription,
          })
          .from(stopLocaleDraft)
          .where(inArray(stopLocaleDraft.stopId, stopIds))
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

  // 6. Get draft tour assets — fall back to published
  let tourAssetsData = await db
    .select({
      asset: asset,
      channel: tourAssetDraft.channel,
      position: tourAssetDraft.position,
      locale: tourAssetDraft.locale,
    })
    .from(tourAssetDraft)
    .innerJoin(asset, eq(tourAssetDraft.assetId, asset.id))
    .where(eq(tourAssetDraft.tourId, tourRow.id))
    .orderBy(asc(tourAssetDraft.position))

  if (tourAssetsData.length === 0) {
    tourAssetsData = await db
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
  }

  // 7. Get draft stop assets — fall back to published
  const stopAssetsData =
    stopIds.length > 0
      ? await db
          .select({
            stopId: stopAssetDraft.stopId,
            asset: asset,
            channel: stopAssetDraft.channel,
            position: stopAssetDraft.position,
            locale: stopAssetDraft.locale,
          })
          .from(stopAssetDraft)
          .innerJoin(asset, eq(stopAssetDraft.assetId, asset.id))
          .where(inArray(stopAssetDraft.stopId, stopIds))
          .orderBy(asc(stopAssetDraft.position))
      : []

  // If no draft stop assets, fall back to published
  let finalStopAssetsData = stopAssetsData
  if (finalStopAssetsData.length === 0 && stopIds.length > 0) {
    finalStopAssetsData = await db
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
  }

  // Group stop assets by stop ID
  const stopAssetsMap = new Map<string, AssetItem[]>()
  for (const item of finalStopAssetsData) {
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
  const stops: StopWithAssets[] = structureStops
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

  // 9. Use all available locales from draft translations
  const draftLocales = tourLocales.map((t) => t.locale)
  const availableLocales = tourRow.availableLocales.filter((locale) => draftLocales.includes(locale))

  // 10. Get draft theme — fall back to published settings
  let themeConfig: ThemeConfig | null = null
  const draftSettings = await db.query.tourSettingsDraft.findFirst({
    where: eq(tourSettingsDraft.tourId, tourRow.id),
  })

  const themeId = draftSettings?.themeId ?? (await getPublishedThemeId(tourRow.id))

  if (themeId) {
    const themeRow = await db.query.theme.findFirst({
      where: eq(themeTable.id, themeId),
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

async function getPublishedThemeId(tourId: string): Promise<string | null> {
  const settings = await db.query.tourSettings.findFirst({
    where: eq(tourSettings.tourId, tourId),
  })
  return settings?.themeId ?? null
}
