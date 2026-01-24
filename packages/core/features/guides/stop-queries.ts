import { db } from '@valguide/core/features/db'
import { and, asc, desc, eq } from 'drizzle-orm'
import { valguideId } from '../../utils/nanoid'
import { getActiveVersionId, getStopAssetPointers } from '../assets/pointer-helpers'
import { asset, stopAsset, stopAssetVersion } from '../assets/schema'
import { guide, guideStop, stop, stopTranslation } from './schema'
import type { IndependentStopMetadata, StopDetailItem, StopGuideAssociation, StopLocaleData } from './types'

export async function getStopsByOrganizationId(organizationId: string) {
  return db.query.stop.findMany({
    where: eq(stop.organizationId, organizationId),
    orderBy: [desc(stop.createdAt)],
    with: {
      translations: {
        with: {
          currentVersion: true,
          draftVersion: true,
        },
      },
      guideStops: {
        with: {
          guide: {
            with: {
              translations: {
                with: {
                  currentVersion: true,
                },
              },
            },
          },
        },
      },
    },
  })
}

export async function getStopByNanoId(nanoId: string) {
  return db.query.stop.findFirst({
    where: eq(stop.nanoId, nanoId),
    with: {
      translations: {
        with: {
          currentVersion: true,
          draftVersion: true,
        },
      },
    },
  })
}

/**
 * Get stops for a guide ordered by position (uses junction table)
 */
export async function getGuideStopsOrdered(guideId: string) {
  const result = await db.query.guideStop.findMany({
    where: eq(guideStop.guideId, guideId),
    orderBy: [asc(guideStop.position)],
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

/**
 * Create a new stop and add it to a guide
 * Uses the junction table for ordering
 */
export async function createStop({
  guideId,
  userId,
  translations,
  position,
}: {
  guideId: string
  userId: string
  translations: Array<{
    locale: string
    title: string | null | undefined
    description?: string | null | undefined
    transcription?: string | null | undefined
  }>
  position?: number
}) {
  return await db.transaction(async (tx: typeof db) => {
    // Get guide to determine organizationId
    const [guideData] = await tx
      .select({ organizationId: guide.organizationId })
      .from(guide)
      .where(eq(guide.id, guideId))
      .limit(1)

    if (!guideData) {
      throw new Error('Guide not found')
    }

    // Determine position - if not specified, add at the end
    let finalPosition = position
    if (finalPosition === undefined) {
      const maxPositionResult = await tx
        .select({ maxPos: guideStop.position })
        .from(guideStop)
        .where(eq(guideStop.guideId, guideId))
        .orderBy(asc(guideStop.position))
      const maxPosition = maxPositionResult.length > 0 ? Math.max(...maxPositionResult.map((r) => r.maxPos)) : -1
      finalPosition = maxPosition + 1
    }

    // Create stop with organizationId
    const [newStop] = await tx
      .insert(stop)
      .values({
        organizationId: guideData.organizationId,
        nanoId: valguideId(),
        createdBy: userId,
        // Deprecated fields kept for backward compatibility
        guideId,
        order: finalPosition,
      })
      .returning()

    if (!newStop) {
      throw new Error('Failed to create stop')
    }

    // Add to the junction table
    await tx.insert(guideStop).values({
      guideId,
      stopId: newStop.id,
      position: finalPosition,
    })

    // Create translations
    const newTranslations = await tx
      .insert(stopTranslation)
      .values(
        translations.map((t) => ({
          stopId: newStop.id,
          locale: t.locale,
        })),
      )
      .returning()

    return {
      ...newStop,
      translations: newTranslations,
    }
  })
}

// ============================================================================
// Independent Stop Editing Queries
// ============================================================================

// Locale priority for fallback (if preferred locale not available)
const LOCALE_FALLBACK_ORDER = ['en', 'de', 'rm']

/**
 * Resolve the best title from guide translations (title only, for associations)
 */
function resolveBestTitle(
  translations: Array<{
    locale: string
    draftVersion: { title: string | null } | null
    currentVersion: { title: string | null } | null
  }>,
  preferredLocale: string,
): string {
  // Try preferred locale first
  const preferred = translations.find((t) => t.locale === preferredLocale)
  if (preferred?.draftVersion?.title) return preferred.draftVersion.title
  if (preferred?.currentVersion?.title) return preferred.currentVersion.title

  // Try fallback locales
  for (const fallbackLocale of LOCALE_FALLBACK_ORDER) {
    if (fallbackLocale === preferredLocale) continue
    const fallback = translations.find((t) => t.locale === fallbackLocale)
    if (fallback?.draftVersion?.title) return fallback.draftVersion.title
    if (fallback?.currentVersion?.title) return fallback.currentVersion.title
  }

  // Last resort: any translation with content
  for (const t of translations) {
    if (t.draftVersion?.title) return t.draftVersion.title
    if (t.currentVersion?.title) return t.currentVersion.title
  }

  return 'Untitled'
}

/**
 * Resolve the best available translation for display
 */
function resolveBestStopTranslation(
  translations: Array<{
    locale: string
    draftVersion: { title: string | null; description: string | null } | null
    currentVersion: { title: string | null; description: string | null } | null
  }>,
  preferredLocale: string,
): { title: string | null; description: string | null; locale: string } {
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
 * Get stop metadata for independent stop editing
 * Returns stop info, translation statuses, assets, and guide associations
 */
export async function getStopMetadataByNanoId(nanoId: string): Promise<IndependentStopMetadata | null> {
  const result = await db.query.stop.findFirst({
    where: eq(stop.nanoId, nanoId),
    with: {
      guideStops: {
        with: {
          guide: {
            columns: {
              id: true,
              nanoId: true,
            },
            with: {
              translations: {
                with: {
                  currentVersion: {
                    columns: {
                      title: true,
                    },
                  },
                  draftVersion: {
                    columns: {
                      title: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })

  if (!result) return null

  // Fetch stop asset intermediate record
  const stopAssetRecord = await db.query.stopAsset.findFirst({
    where: eq(stopAsset.stopId, result.id),
  })

  // Prefer draftVersionId for editor context, fallback to currentVersionId
  const stopVersionId = stopAssetRecord?.draftVersionId ?? stopAssetRecord?.currentVersionId
  const stopAssets = stopVersionId
    ? await db
        .select({
          stopAssetId: stopAssetVersion.id,
          asset: asset,
          role: stopAssetVersion.role,
          order: stopAssetVersion.order,
          locale: stopAssetVersion.locale,
        })
        .from(stopAssetVersion)
        .innerJoin(asset, eq(stopAssetVersion.assetId, asset.id))
        .where(eq(stopAssetVersion.versionId, stopVersionId))
        .orderBy(asc(stopAssetVersion.order))
    : []

  // Fetch stop translation statuses
  const stopTranslationStatuses = await db
    .select({
      locale: stopTranslation.locale,
      currentVersionId: stopTranslation.currentVersionId,
      draftVersionId: stopTranslation.draftVersionId,
    })
    .from(stopTranslation)
    .where(eq(stopTranslation.stopId, result.id))

  // Build guide associations with display titles
  const guideAssociations: StopGuideAssociation[] = result.guideStops.map((gs) => {
    const displayTitle = resolveBestTitle(gs.guide.translations, 'en')
    return {
      guideId: gs.guide.id,
      guideNanoId: gs.guide.nanoId,
      position: gs.position,
      visible: gs.visible,
      displayTitle,
    }
  })

  return {
    id: result.id,
    nanoId: result.nanoId,
    organizationId: result.organizationId,
    availableLocales: result.availableLocales,
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
    currentAssetVersionId: stopAssetRecord?.currentVersionId ?? null,
    draftAssetVersionId: stopAssetRecord?.draftVersionId ?? null,
    assets: stopAssets.map((item) => ({
      ...item.asset,
      stopAssetId: item.stopAssetId,
      role: item.role,
      order: item.order,
      locale: item.locale,
    })),
    translationStatuses: stopTranslationStatuses.map((t) => ({
      locale: t.locale,
      currentVersionId: t.currentVersionId,
      draftVersionId: t.draftVersionId,
    })),
    guideAssociations,
  }
}

/**
 * Get stop translation for a single locale (independent editing)
 * Returns stop translation with current and draft versions
 */
export async function getStopTranslationForLocale(stopId: string, locale: string): Promise<StopLocaleData> {
  const stopTranslationResult = await db.query.stopTranslation.findFirst({
    where: and(eq(stopTranslation.stopId, stopId), eq(stopTranslation.locale, locale)),
    with: {
      currentVersion: true,
      draftVersion: true,
    },
  })

  return {
    locale,
    stopTranslation: stopTranslationResult
      ? {
          translationId: stopTranslationResult.id,
          currentVersionId: stopTranslationResult.currentVersionId,
          draftVersionId: stopTranslationResult.draftVersionId,
          currentVersion: stopTranslationResult.currentVersion
            ? {
                id: stopTranslationResult.currentVersion.id,
                title: stopTranslationResult.currentVersion.title,
                description: stopTranslationResult.currentVersion.description,
                transcription: stopTranslationResult.currentVersion.transcription,
              }
            : null,
          draftVersion: stopTranslationResult.draftVersion
            ? {
                id: stopTranslationResult.draftVersion.id,
                title: stopTranslationResult.draftVersion.title,
                description: stopTranslationResult.draftVersion.description,
                transcription: stopTranslationResult.draftVersion.transcription,
              }
            : null,
        }
      : null,
  }
}

/**
 * Get stop detail by nanoId with all data for overview page
 */
export async function getStopDetailByNanoId(
  nanoId: string,
  preferredLocale: string = 'en',
): Promise<StopDetailItem | null> {
  const result = await db.query.stop.findFirst({
    where: eq(stop.nanoId, nanoId),
    with: {
      translations: {
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
      guideStops: {
        with: {
          guide: {
            columns: {
              id: true,
              nanoId: true,
            },
            with: {
              translations: {
                with: {
                  currentVersion: {
                    columns: {
                      title: true,
                    },
                  },
                  draftVersion: {
                    columns: {
                      title: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })

  if (!result) return null

  // Fetch stop assets
  const stopAssetPointers = await getStopAssetPointers([result.id])
  const stopAssetVersionId = getActiveVersionId(stopAssetPointers.get(result.id))
  const stopAssets = stopAssetVersionId
    ? await db
        .select({
          stopAssetId: stopAssetVersion.id,
          asset: asset,
          role: stopAssetVersion.role,
          order: stopAssetVersion.order,
          locale: stopAssetVersion.locale,
        })
        .from(stopAssetVersion)
        .innerJoin(asset, eq(stopAssetVersion.assetId, asset.id))
        .where(eq(stopAssetVersion.versionId, stopAssetVersionId))
        .orderBy(asc(stopAssetVersion.order))
    : []

  // Resolve best translation
  const resolved = resolveBestStopTranslation(result.translations, preferredLocale)

  // Build translation summaries
  const translationSummaries = result.translations.map((t) => {
    const version = t.draftVersion ?? t.currentVersion
    return {
      locale: t.locale,
      title: version?.title ?? 'Untitled',
    }
  })

  // Build guide associations
  const guideAssociations: StopGuideAssociation[] = result.guideStops.map((gs) => {
    const displayTitle = resolveBestTitle(gs.guide.translations, preferredLocale)
    return {
      guideId: gs.guide.id,
      guideNanoId: gs.guide.nanoId,
      position: gs.position,
      visible: gs.visible,
      displayTitle,
    }
  })

  return {
    id: result.id,
    nanoId: result.nanoId,
    organizationId: result.organizationId,
    availableLocales: result.availableLocales,
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
    displayTitle: resolved.title,
    displayDescription: resolved.description,
    displayLocale: resolved.locale,
    translationSummaries,
    guideAssociations,
    assets: stopAssets.map((item) => ({
      ...item.asset,
      stopAssetId: item.stopAssetId,
      role: item.role,
      order: item.order,
      locale: item.locale,
    })),
  }
}
