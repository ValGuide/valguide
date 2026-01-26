/**
 * Public queries for fetching published guide content.
 * Used by the consumer-facing app to display published guides and stops.
 *
 * These queries read from the published tables (guideStop, guideAsset, stopAsset)
 * and published locale versions (guideLocaleVersion, stopLocaleVersion).
 */

import { and, asc, eq, inArray, isNotNull, isNull } from 'drizzle-orm'
import { asset } from '../assets/schema'
import type { Asset } from '../assets/types'
import type { DB } from '../db'
import {
  guide,
  guideAsset,
  guideLocale,
  guideLocaleVersion,
  guideStop,
  stop,
  stopAsset,
  stopLocale,
  stopLocaleVersion,
} from './schema'

// ============================================================================
// Types for published content
// ============================================================================

/**
 * Asset with role/channel info for display purposes.
 * Maps the new channel-based schema to the legacy role-based API.
 */
export interface AssetWithRole extends Asset {
  role: string
  order: number
  locale?: string | null
}

/**
 * Published translation content (title, description).
 */
export interface PublishedTranslation {
  locale: string
  title: string | null
  description: string | null
}

/**
 * Published stop translation content (includes transcription).
 */
export interface PublishedStopTranslation extends PublishedTranslation {
  transcription: string | null
}

/**
 * Stop with its published translations and assets.
 */
export interface StopWithAssets {
  id: string
  nanoId: string
  organizationId: string
  createdAt: Date
  updatedAt: Date
  availableLocales: string[]
  translations: PublishedStopTranslation[]
  assets: AssetWithRole[]
}

/**
 * Guide with its published translations, stops, and assets.
 */
export interface GuideWithStopsAndAssets {
  id: string
  nanoId: string
  organizationId: string
  createdAt: Date
  updatedAt: Date
  availableLocales: string[]
  translations: PublishedTranslation[]
  assets: AssetWithRole[]
  stops: StopWithAssets[]
}

// ============================================================================
// Query Functions
// ============================================================================

/**
 * Get a published guide by its nanoId.
 * Returns null if the guide doesn't exist, is deleted, archived, or has no published content.
 */
export async function getPublishedGuideByNanoId(db: DB, nanoId: string): Promise<GuideWithStopsAndAssets | null> {
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
  const stopAssetsMap = new Map<string, AssetWithRole[]>()
  for (const item of stopAssetsData) {
    if (!stopAssetsMap.has(item.stopId)) {
      stopAssetsMap.set(item.stopId, [])
    }
    stopAssetsMap.get(item.stopId)?.push({
      ...item.asset,
      role: mapChannelToRole(item.channel),
      order: item.position,
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
      role: mapChannelToRole(item.channel),
      order: item.position,
      locale: item.locale,
    })),
    stops,
  }
}

/**
 * Get a published stop by its nanoId.
 * Returns null if the stop doesn't exist, is deleted, archived, or has no published content.
 */
export async function getPublishedStopByNanoId(db: DB, nanoId: string): Promise<StopWithAssets | null> {
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
      role: mapChannelToRole(item.channel),
      order: item.position,
      locale: item.locale,
    })),
  }
}

// ============================================================================
// Helpers
// ============================================================================

// ============================================================================
// Localization Helpers
// ============================================================================

/**
 * Get localized guide text (title or description) with fallback.
 */
export function getLocalizedGuideText(
  guide: { translations: PublishedTranslation[] },
  field: 'title' | 'description',
  locale: string,
  fallbackLocale: string = 'en',
): string {
  const translation = guide.translations.find((t) => t.locale === locale)
  if (translation?.[field]) {
    return translation[field] || ''
  }

  const fallbackTranslation = guide.translations.find((t) => t.locale === fallbackLocale)
  if (fallbackTranslation?.[field]) {
    return fallbackTranslation[field] || ''
  }

  const firstTranslation = guide.translations[0]
  return firstTranslation?.[field] || ''
}

/**
 * Get localized stop text (title, description, or transcription) with fallback.
 */
export function getLocalizedStopText(
  stop: { translations: PublishedStopTranslation[] },
  field: 'title' | 'description' | 'transcription',
  locale: string,
  fallbackLocale: string = 'en',
): string {
  const translation = stop.translations.find((t) => t.locale === locale)
  if (translation?.[field]) {
    return translation[field] || ''
  }

  const fallbackTranslation = stop.translations.find((t) => t.locale === fallbackLocale)
  if (fallbackTranslation?.[field]) {
    return fallbackTranslation[field] || ''
  }

  const firstTranslation = stop.translations[0]
  return firstTranslation?.[field] || ''
}

// ============================================================================
// Internal Helpers
// ============================================================================

/**
 * Map channel names to legacy role names for backward compatibility.
 * Channels: images.hero, images.gallery, audio.narration, etc.
 * Roles: cover, gallery, thumbnail, audio, video
 */
function mapChannelToRole(channel: string): string {
  if (channel === 'images.hero') return 'cover'
  if (channel === 'images.gallery') return 'gallery'
  if (channel === 'images.thumbnail') return 'thumbnail'
  if (channel.startsWith('audio.')) return 'audio'
  if (channel.startsWith('video.')) return 'video'
  // Default: use channel as role
  return channel
}

/**
 * Get a stop by its nanoId (basic info only, no assets).
 * Used for quick lookups.
 */
export async function getStopByNanoId(db: DB, nanoId: string): Promise<StopWithAssets | null> {
  return getPublishedStopByNanoId(db, nanoId)
}

/**
 * Get the guide ID that contains a stop by the stop's nanoId.
 * Returns null if the stop is not part of any published guide.
 */
export async function getGuideIdByStopNanoId(db: DB, stopNanoId: string): Promise<string | null> {
  const stopRow = await db.query.stop.findFirst({
    where: and(eq(stop.nanoId, stopNanoId), isNull(stop.deletedAt)),
  })

  if (!stopRow) return null

  // Find the guide that contains this stop in its published structure
  const guideStopRow = await db.query.guideStop.findFirst({
    where: eq(guideStop.stopId, stopRow.id),
  })

  if (!guideStopRow) return null

  // Get the guide nanoId
  const guideRow = await db.query.guide.findFirst({
    where: eq(guide.id, guideStopRow.guideId),
  })

  return guideRow?.nanoId ?? null
}
