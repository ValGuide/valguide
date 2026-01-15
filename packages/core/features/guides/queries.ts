import { type DB, db } from '@valguide/core/features/db'
import { and, asc, desc, eq, inArray, isNotNull, isNull } from 'drizzle-orm'
import { valguideId } from '../../utils/nanoid'
import { asset, guideAsset, stopAsset } from '../assets/schema'
import { guide, guideStop, guideTranslation, guideTranslationVersion, stop, stopTranslation } from './schema'
import { upsertGuideTranslationDraft } from './translation-mutations'

// Re-export types from types.ts for backward compatibility
// IMPORTANT: Import types from '@valguide/core/features/guides/types' in client code
// to avoid importing db.ts (which breaks Storybook)
export type { AssetWithRole, GuideWithStopsAndAssets, GuideWithTranslationsAndCover, StopWithAssets } from './types'

import type { GuideWithTranslations, StopWithTranslations } from './schema'
import type {
  AssetWithRole,
  GuideListItem,
  GuideLocaleData,
  GuideMetadata,
  GuideViewData,
  GuideWithStopsAndAssets,
  GuideWithTranslationsAndCover,
  StopWithAssets,
} from './types'

/**
 * Query utilities for guides with i18n support
 */

/**
 * Get a guide by ID with all its translations
 */
export async function getGuideById(db: DB, guideId: string): Promise<GuideWithTranslations | null> {
  const result = await db.query.guide.findFirst({
    where: and(eq(guide.id, guideId), isNull(guide.archivedAt), isNull(guide.deletedAt)),
    with: {
      translations: true,
    },
  })

  return result ?? null
}

/**
 * Get all guides for a specific organization with their translations and cover images
 */
export async function getGuidesByOrganizationId(
  db: DB,
  organizationId: string,
): Promise<GuideWithTranslationsAndCover[]> {
  const guides = await db.query.guide.findMany({
    where: and(eq(guide.organizationId, organizationId), isNull(guide.archivedAt), isNull(guide.deletedAt)),
    with: {
      translations: {
        with: {
          currentVersion: true,
          draftVersion: true,
        },
      },
    },
    orderBy: [desc(guide.createdAt)],
  })

  if (guides.length === 0) return []

  // Fetch cover images for all guides
  const guideIds = guides.map((g) => g.id)
  const coverAssets = await db
    .select({
      guideId: guideAsset.guideId,
      guideAssetId: guideAsset.id,
      asset: asset,
      role: guideAsset.role,
      order: guideAsset.order,
      locale: guideAsset.locale,
    })
    .from(guideAsset)
    .innerJoin(asset, eq(guideAsset.assetId, asset.id))
    .where(and(inArray(guideAsset.guideId, guideIds), eq(guideAsset.role, 'cover')))

  // Map cover assets by guide ID
  const coverMap = new Map<string, AssetWithRole>()
  for (const item of coverAssets) {
    if (!coverMap.has(item.guideId)) {
      coverMap.set(item.guideId, {
        ...item.asset,
        guideAssetId: item.guideAssetId,
        role: item.role,
        order: item.order,
        locale: item.locale,
      })
    }
  }

  return guides.map((g) => ({
    ...g,
    coverImage: coverMap.get(g.id) ?? null,
  }))
}

// Locale priority for fallback (if preferred locale not available)
const LOCALE_FALLBACK_ORDER = ['en', 'de', 'rm']

/**
 * Resolve the best available translation for display
 * Priority:
 * 1. Draft version in preferred locale
 * 2. Current version in preferred locale
 * 3. Draft version in any locale (by fallback order)
 * 4. Current version in any locale (by fallback order)
 */
function resolveBestTranslation(
  translations: Array<{
    locale: string
    draftVersion: { title: string; description: string | null } | null
    currentVersion: { title: string; description: string | null } | null
  }>,
  preferredLocale: string,
): { title: string; description: string | null; locale: string } {
  // Try preferred locale first
  const preferred = translations.find((t) => t.locale === preferredLocale)
  if (preferred?.draftVersion?.title) {
    return {
      title: preferred.draftVersion.title,
      description: preferred.draftVersion.description,
      locale: preferredLocale,
    }
  }
  if (preferred?.currentVersion?.title) {
    return {
      title: preferred.currentVersion.title,
      description: preferred.currentVersion.description,
      locale: preferredLocale,
    }
  }

  // Try fallback locales
  for (const fallbackLocale of LOCALE_FALLBACK_ORDER) {
    if (fallbackLocale === preferredLocale) continue
    const fallback = translations.find((t) => t.locale === fallbackLocale)
    if (fallback?.draftVersion?.title) {
      return {
        title: fallback.draftVersion.title,
        description: fallback.draftVersion.description,
        locale: fallbackLocale,
      }
    }
    if (fallback?.currentVersion?.title) {
      return {
        title: fallback.currentVersion.title,
        description: fallback.currentVersion.description,
        locale: fallbackLocale,
      }
    }
  }

  // Last resort: any translation with content
  for (const t of translations) {
    if (t.draftVersion?.title) {
      return {
        title: t.draftVersion.title,
        description: t.draftVersion.description,
        locale: t.locale,
      }
    }
    if (t.currentVersion?.title) {
      return {
        title: t.currentVersion.title,
        description: t.currentVersion.description,
        locale: t.locale,
      }
    }
  }

  return { title: 'Untitled', description: null, locale: preferredLocale }
}

/**
 * Get lightweight guide list for a specific organization
 * Optimized for list views - fetches only necessary data with translation fallback applied
 */
export async function getGuidesListByOrganizationId(
  db: DB,
  organizationId: string,
  preferredLocale: string,
): Promise<GuideListItem[]> {
  // Fetch guides with only necessary translation data
  const guides = await db.query.guide.findMany({
    where: and(eq(guide.organizationId, organizationId), isNull(guide.archivedAt), isNull(guide.deletedAt)),
    columns: {
      id: true,
      nanoId: true,
      published: true,
      createdAt: true,
      updatedAt: true,
    },
    with: {
      translations: {
        columns: {
          locale: true,
        },
        with: {
          currentVersion: {
            columns: {
              title: true,
              description: true,
            },
          },
          draftVersion: {
            columns: {
              title: true,
              description: true,
            },
          },
        },
      },
    },
    orderBy: [desc(guide.createdAt)],
  })

  if (guides.length === 0) return []

  // Fetch cover images for all guides
  const guideIds = guides.map((g) => g.id)
  const coverAssets = await db
    .select({
      guideId: guideAsset.guideId,
      guideAssetId: guideAsset.id,
      asset: asset,
      role: guideAsset.role,
      order: guideAsset.order,
      locale: guideAsset.locale,
    })
    .from(guideAsset)
    .innerJoin(asset, eq(guideAsset.assetId, asset.id))
    .where(and(inArray(guideAsset.guideId, guideIds), eq(guideAsset.role, 'cover')))

  // Map cover assets by guide ID
  const coverMap = new Map<string, AssetWithRole>()
  for (const item of coverAssets) {
    if (!coverMap.has(item.guideId)) {
      coverMap.set(item.guideId, {
        ...item.asset,
        guideAssetId: item.guideAssetId,
        role: item.role,
        order: item.order,
        locale: item.locale,
      })
    }
  }

  return guides.map((g) => {
    const resolved = resolveBestTranslation(g.translations, preferredLocale)
    return {
      id: g.id,
      nanoId: g.nanoId,
      published: g.published,
      createdAt: g.createdAt,
      updatedAt: g.updatedAt,
      coverImage: coverMap.get(g.id) ?? null,
      displayTitle: resolved.title,
      displayDescription: resolved.description,
      displayLocale: resolved.locale,
    }
  })
}

/**
 * Create a new guide with translations
 * Automatically generates a nanoId if not provided
 */
export async function createGuide(
  db: DB,
  guideData: Omit<typeof guide.$inferInsert, 'nanoId'> & { nanoId?: string },
  translations: Array<{ locale: string; title: string; description?: string }>,
) {
  return await db.transaction(async (tx: DB) => {
    // Insert guide with auto-generated nanoId if not provided
    const [newGuide] = await tx
      .insert(guide)
      .values({
        ...guideData,
        nanoId: guideData.nanoId ?? valguideId(),
      })
      .returning()

    if (!newGuide) {
      throw new Error('Failed to create guide')
    }

    // Insert translations with initial draft versions
    const newTranslations = []
    for (const t of translations) {
      // Create translation pointer
      const [newTranslation] = await tx
        .insert(guideTranslation)
        .values({
          guideId: newGuide.id,
          locale: t.locale,
        })
        .returning()

      if (!newTranslation) {
        throw new Error('Failed to create guide translation')
      }

      // Create initial draft version
      const [draftVersion] = await tx
        .insert(guideTranslationVersion)
        .values({
          translationId: newTranslation.id,
          version: 1,
          status: 'draft',
          title: t.title,
          description: t.description ?? null,
          createdBy: guideData.createdBy,
        })
        .returning()

      if (!draftVersion) {
        throw new Error('Failed to create guide translation version')
      }

      // Update pointer to draft
      await tx
        .update(guideTranslation)
        .set({ draftVersionId: draftVersion.id })
        .where(eq(guideTranslation.id, newTranslation.id))

      newTranslations.push({
        ...newTranslation,
        draftVersionId: draftVersion.id,
        draftVersion,
      })
    }

    return {
      ...newGuide,
      translations: newTranslations,
    }
  })
}

/**
 * Get archived guides for a specific organization
 */
export async function getArchivedGuides(db: DB, organizationId: string): Promise<GuideWithTranslations[]> {
  return db.query.guide.findMany({
    where: and(eq(guide.organizationId, organizationId), isNotNull(guide.archivedAt), isNull(guide.deletedAt)),
    with: {
      translations: true,
    },
    orderBy: [desc(guide.archivedAt)],
  })
}

/**
 * Get archived guides for a specific organization with their translations and cover images
 */
export async function getArchivedGuidesWithCover(
  db: DB,
  organizationId: string,
): Promise<GuideWithTranslationsAndCover[]> {
  const guides = await db.query.guide.findMany({
    where: and(eq(guide.organizationId, organizationId), isNotNull(guide.archivedAt), isNull(guide.deletedAt)),
    with: {
      translations: {
        with: {
          currentVersion: true,
          draftVersion: true,
        },
      },
    },
    orderBy: [desc(guide.archivedAt)],
  })

  if (guides.length === 0) return []

  const guideIds = guides.map((g) => g.id)
  const coverAssets = await db
    .select({
      guideId: guideAsset.guideId,
      guideAssetId: guideAsset.id,
      asset: asset,
      role: guideAsset.role,
      order: guideAsset.order,
      locale: guideAsset.locale,
    })
    .from(guideAsset)
    .innerJoin(asset, eq(guideAsset.assetId, asset.id))
    .where(and(inArray(guideAsset.guideId, guideIds), eq(guideAsset.role, 'cover')))

  const coverMap = new Map<string, AssetWithRole>()
  for (const item of coverAssets) {
    if (!coverMap.has(item.guideId)) {
      coverMap.set(item.guideId, {
        ...item.asset,
        guideAssetId: item.guideAssetId,
        role: item.role,
        order: item.order,
        locale: item.locale,
      })
    }
  }

  return guides.map((g) => ({
    ...g,
    coverImage: coverMap.get(g.id) ?? null,
  }))
}

/**
 * Update a guide translation for a specific locale
 * Creates a new translation if one doesn't exist
 */
export async function updateGuideTranslation(
  guideId: string,
  locale: string,
  data: { title?: string; description?: string },
): Promise<typeof guideTranslation.$inferSelect> {
  if (!data.title) {
    throw new Error('Title is required')
  }

  const versionId = await upsertGuideTranslationDraft(guideId, locale, {
    title: data.title,
    description: data.description,
  })

  return { versionId } as unknown as typeof guideTranslation.$inferSelect
}

/**
 * Get a published guide by nanoId with all assets for the app viewer
 * Uses junction table for stops ordering
 */
export async function getPublishedGuideByNanoId(db: DB, nanoId: string): Promise<GuideWithStopsAndAssets | null> {
  const result = await db.query.guide.findFirst({
    where: and(eq(guide.nanoId, nanoId), isNull(guide.deletedAt), isNull(guide.archivedAt), isNotNull(guide.published)),
    with: {
      translations: true,
      guideStops: {
        orderBy: asc(guideStop.position),
        with: {
          stop: {
            with: {
              translations: true,
            },
          },
        },
      },
    },
  })

  if (!result) return null

  // Extract stops from guideStops junction
  const stops = result.guideStops.map((gs) => gs.stop)

  // Fetch guide assets
  const guideAssets = await db
    .select({
      guideAssetId: guideAsset.id,
      asset: asset,
      role: guideAsset.role,
      order: guideAsset.order,
      locale: guideAsset.locale,
    })
    .from(guideAsset)
    .innerJoin(asset, eq(guideAsset.assetId, asset.id))
    .where(eq(guideAsset.guideId, result.id))
    .orderBy(asc(guideAsset.order))

  // Fetch all stop assets
  const stopIds = stops.map((s) => s.id)
  const stopAssetsData =
    stopIds.length > 0
      ? await db
          .select({
            stopId: stopAsset.stopId,
            stopAssetId: stopAsset.id,
            asset: asset,
            role: stopAsset.role,
            order: stopAsset.order,
            locale: stopAsset.locale,
          })
          .from(stopAsset)
          .innerJoin(asset, eq(stopAsset.assetId, asset.id))
          .where(inArray(stopAsset.stopId, stopIds))
          .orderBy(asc(stopAsset.order))
      : []

  // Group stop assets by stop ID
  const stopAssetsMap = new Map<string, AssetWithRole[]>()
  for (const item of stopAssetsData) {
    if (!stopAssetsMap.has(item.stopId)) {
      stopAssetsMap.set(item.stopId, [])
    }
    stopAssetsMap.get(item.stopId)?.push({
      ...item.asset,
      stopAssetId: item.stopAssetId,
      role: item.role,
      order: item.order,
      locale: item.locale,
    })
  }

  // Filter availableLocales to only include locales with published translations
  const publishedLocales = result.translations.filter((t) => t.currentVersionId != null).map((t) => t.locale)
  const availableLocales = result.availableLocales.filter((locale) => publishedLocales.includes(locale))

  return {
    ...result,
    availableLocales,
    assets: guideAssets.map((item) => ({
      ...item.asset,
      guideAssetId: item.guideAssetId,
      role: item.role,
      order: item.order,
      locale: item.locale,
    })),
    stops: stops.map((s) => ({
      ...s,
      assets: stopAssetsMap.get(s.id) ?? [],
    })),
  }
}

/**
 * Get a stop by nanoId with all its assets for the app viewer
 */
export async function getStopByNanoId(stopNanoId: string): Promise<StopWithAssets | null> {
  const result = await db.query.stop.findFirst({
    where: eq(stop.nanoId, stopNanoId),
    with: {
      translations: true,
    },
  })

  if (!result) return null

  // Fetch stop assets
  const stopAssets = await db
    .select({
      asset: asset,
      role: stopAsset.role,
      order: stopAsset.order,
      locale: stopAsset.locale,
    })
    .from(stopAsset)
    .innerJoin(asset, eq(stopAsset.assetId, asset.id))
    .where(eq(stopAsset.stopId, result.id))
    .orderBy(asc(stopAsset.order))

  return {
    ...result,
    assets: stopAssets.map((item) => ({
      ...item.asset,
      role: item.role,
      order: item.order,
      locale: item.locale,
    })),
  }
}

/**
 * Get guide ID by stop nanoId (returns first guide if stop is in multiple guides)
 */
export async function getGuideIdByStopNanoId(db: DB, stopNanoId: string): Promise<string | null> {
  const result = await db.query.stop.findFirst({
    where: eq(stop.nanoId, stopNanoId),
    with: {
      guideStops: {
        limit: 1,
        columns: {
          guideId: true,
        },
      },
    },
  })

  // First try junction table
  if (result?.guideStops?.[0]?.guideId) {
    return result.guideStops[0].guideId
  }

  // Fallback to deprecated guideId for backward compatibility
  return result?.guideId ?? null
}

/**
 * Get stops for a guide ordered by position
 */
export async function getGuideStops(db: DB, guideId: string): Promise<StopWithTranslations[]> {
  const result = await db.query.guideStop.findMany({
    where: eq(guideStop.guideId, guideId),
    orderBy: asc(guideStop.position),
    with: {
      stop: {
        with: {
          translations: {
            with: {
              currentVersion: true,
              draftVersion: true,
            },
          },
        },
      },
    },
  })

  return result.map((gs) => gs.stop)
}

// ============================================================================
// Lightweight Editor Queries (Stage 2 - per-locale fetching)
// ============================================================================

/**
 * Get guide metadata without translations (for editor shell)
 * Returns guide base data, availableLocales, stops (id, nanoId, position), and all assets
 */
export async function getGuideMetadata(nanoId: string): Promise<GuideMetadata | null> {
  const result = await db.query.guide.findFirst({
    where: and(eq(guide.nanoId, nanoId), isNull(guide.archivedAt), isNull(guide.deletedAt)),
    with: {
      guideStops: {
        orderBy: asc(guideStop.position),
        columns: {
          position: true,
        },
        with: {
          stop: {
            columns: {
              id: true,
              nanoId: true,
            },
          },
        },
      },
    },
  })

  if (!result) return null

  // Fetch guide assets
  const guideAssets = await db
    .select({
      guideAssetId: guideAsset.id,
      asset: asset,
      role: guideAsset.role,
      order: guideAsset.order,
      locale: guideAsset.locale,
    })
    .from(guideAsset)
    .innerJoin(asset, eq(guideAsset.assetId, asset.id))
    .where(eq(guideAsset.guideId, result.id))
    .orderBy(asc(guideAsset.order))

  // Fetch all stop assets
  const stopIds = result.guideStops.map((gs) => gs.stop.id)
  const stopAssetsData =
    stopIds.length > 0
      ? await db
          .select({
            stopId: stopAsset.stopId,
            stopAssetId: stopAsset.id,
            asset: asset,
            role: stopAsset.role,
            order: stopAsset.order,
            locale: stopAsset.locale,
          })
          .from(stopAsset)
          .innerJoin(asset, eq(stopAsset.assetId, asset.id))
          .where(inArray(stopAsset.stopId, stopIds))
          .orderBy(asc(stopAsset.order))
      : []

  // Group stop assets by stop ID
  const stopAssetsMap = new Map<string, AssetWithRole[]>()
  for (const item of stopAssetsData) {
    if (!stopAssetsMap.has(item.stopId)) {
      stopAssetsMap.set(item.stopId, [])
    }
    stopAssetsMap.get(item.stopId)?.push({
      ...item.asset,
      stopAssetId: item.stopAssetId,
      role: item.role,
      order: item.order,
      locale: item.locale,
    })
  }

  // Fetch stop translation statuses (just IDs, no content) for all locales
  const stopTranslationStatuses =
    stopIds.length > 0
      ? await db
          .select({
            stopId: stopTranslation.stopId,
            locale: stopTranslation.locale,
            currentVersionId: stopTranslation.currentVersionId,
            draftVersionId: stopTranslation.draftVersionId,
          })
          .from(stopTranslation)
          .where(inArray(stopTranslation.stopId, stopIds))
      : []

  // Group translation statuses by stop ID
  const stopTranslationStatusesMap = new Map<
    string,
    Array<{ locale: string; currentVersionId: string | null; draftVersionId: string | null }>
  >()
  for (const item of stopTranslationStatuses) {
    if (!stopTranslationStatusesMap.has(item.stopId)) {
      stopTranslationStatusesMap.set(item.stopId, [])
    }
    stopTranslationStatusesMap.get(item.stopId)?.push({
      locale: item.locale,
      currentVersionId: item.currentVersionId,
      draftVersionId: item.draftVersionId,
    })
  }

  // Fetch guide translation statuses (just IDs, no content) for all locales
  const guideTranslationStatuses = await db
    .select({
      locale: guideTranslation.locale,
      currentVersionId: guideTranslation.currentVersionId,
      draftVersionId: guideTranslation.draftVersionId,
    })
    .from(guideTranslation)
    .where(eq(guideTranslation.guideId, result.id))

  return {
    id: result.id,
    nanoId: result.nanoId,
    organizationId: result.organizationId,
    availableLocales: result.availableLocales,
    published: result.published,
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
    assets: guideAssets.map((item) => ({
      ...item.asset,
      guideAssetId: item.guideAssetId,
      role: item.role,
      order: item.order,
      locale: item.locale,
    })),
    stops: result.guideStops.map((gs) => ({
      id: gs.stop.id,
      nanoId: gs.stop.nanoId,
      position: gs.position,
      assets: stopAssetsMap.get(gs.stop.id) ?? [],
      translationStatuses: stopTranslationStatusesMap.get(gs.stop.id) ?? [],
    })),
    translationStatuses: guideTranslationStatuses.map((t) => ({
      locale: t.locale,
      currentVersionId: t.currentVersionId,
      draftVersionId: t.draftVersionId,
    })),
  }
}

/**
 * Get guide translations for a single locale
 * Returns guide translation (current + draft) and all stop translations for that locale
 */
export async function getGuideTranslationsForLocale(guideId: string, locale: string): Promise<GuideLocaleData> {
  // Fetch guide translation for the locale
  const guideTranslationResult = await db.query.guideTranslation.findFirst({
    where: and(eq(guideTranslation.guideId, guideId), eq(guideTranslation.locale, locale)),
    with: {
      currentVersion: true,
      draftVersion: true,
    },
  })

  // Fetch all stops for this guide
  const guideStopsResult = await db.query.guideStop.findMany({
    where: eq(guideStop.guideId, guideId),
    orderBy: asc(guideStop.position),
    columns: {
      stopId: true,
    },
  })

  const stopIds = guideStopsResult.map((gs) => gs.stopId)

  // Fetch stop translations for the locale
  const stopTranslationsResult =
    stopIds.length > 0
      ? await db.query.stopTranslation.findMany({
          where: and(inArray(stopTranslation.stopId, stopIds), eq(stopTranslation.locale, locale)),
          with: {
            currentVersion: true,
            draftVersion: true,
          },
        })
      : []

  // Create a map for quick lookup
  const stopTranslationMap = new Map(stopTranslationsResult.map((st) => [st.stopId, st]))

  return {
    locale,
    guideTranslation: guideTranslationResult
      ? {
          translationId: guideTranslationResult.id,
          currentVersionId: guideTranslationResult.currentVersionId,
          draftVersionId: guideTranslationResult.draftVersionId,
          currentVersion: guideTranslationResult.currentVersion
            ? {
                id: guideTranslationResult.currentVersion.id,
                title: guideTranslationResult.currentVersion.title,
                description: guideTranslationResult.currentVersion.description,
              }
            : null,
          draftVersion: guideTranslationResult.draftVersion
            ? {
                id: guideTranslationResult.draftVersion.id,
                title: guideTranslationResult.draftVersion.title,
                description: guideTranslationResult.draftVersion.description,
              }
            : null,
        }
      : null,
    stopTranslations: stopIds.map((stopId) => {
      const st = stopTranslationMap.get(stopId)
      return {
        stopId,
        translationId: st?.id ?? '',
        currentVersionId: st?.currentVersionId ?? null,
        draftVersionId: st?.draftVersionId ?? null,
        currentVersion: st?.currentVersion
          ? {
              id: st.currentVersion.id,
              title: st.currentVersion.title,
              description: st.currentVersion.description,
              transcription: st.currentVersion.transcription,
            }
          : null,
        draftVersion: st?.draftVersion
          ? {
              id: st.draftVersion.id,
              title: st.draftVersion.title,
              description: st.draftVersion.description,
              transcription: st.draftVersion.transcription,
            }
          : null,
      }
    }),
  }
}

/**
 * Get guide with all translations for view page
 * Returns guide metadata + all translations (no stops needed for view)
 */
export async function getGuideViewData(nanoId: string): Promise<GuideViewData | null> {
  const result = await db.query.guide.findFirst({
    where: and(eq(guide.nanoId, nanoId), isNull(guide.archivedAt), isNull(guide.deletedAt)),
    with: {
      translations: {
        with: {
          currentVersion: true,
          draftVersion: true,
        },
      },
    },
  })

  if (!result) return null

  // Fetch guide assets
  const guideAssets = await db
    .select({
      guideAssetId: guideAsset.id,
      asset: asset,
      role: guideAsset.role,
      order: guideAsset.order,
      locale: guideAsset.locale,
    })
    .from(guideAsset)
    .innerJoin(asset, eq(guideAsset.assetId, asset.id))
    .where(eq(guideAsset.guideId, result.id))
    .orderBy(asc(guideAsset.order))

  return {
    id: result.id,
    nanoId: result.nanoId,
    organizationId: result.organizationId,
    availableLocales: result.availableLocales,
    published: result.published,
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
    assets: guideAssets.map((item) => ({
      ...item.asset,
      guideAssetId: item.guideAssetId,
      role: item.role,
      order: item.order,
      locale: item.locale,
    })),
    translations: result.translations.map((t) => ({
      id: t.id,
      locale: t.locale,
      currentVersionId: t.currentVersionId,
      draftVersionId: t.draftVersionId,
      currentVersion: t.currentVersion
        ? {
            id: t.currentVersion.id,
            title: t.currentVersion.title,
            description: t.currentVersion.description,
          }
        : null,
      draftVersion: t.draftVersion
        ? {
            id: t.draftVersion.id,
            title: t.draftVersion.title,
            description: t.draftVersion.description,
          }
        : null,
    })),
  }
}
