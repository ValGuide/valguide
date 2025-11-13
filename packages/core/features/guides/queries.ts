import { eq, and, asc, isNull, isNotNull, desc, sql, inArray } from 'drizzle-orm'
import type { DB } from '../db'
import {
  guide,
  guideTranslation,
  stop,
  stopTranslation,
  type GuideWithTranslations,
  type GuideWithStops,
  type StopWithTranslations,
} from './schema'
import { asset, guideAsset, stopAsset, type Asset } from '../assets/schema'
import type { SupportedLocale } from '../../i18n/i18n.config'
import { customAlphabet } from 'nanoid'

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 10)

// Extended types for app viewer
export type AssetWithRole = Asset & {
  role: string
  order: number
  locale?: string | null
}

export type StopWithAssets = StopWithTranslations & {
  assets: AssetWithRole[]
}

export type GuideWithStopsAndAssets = GuideWithStops & {
  assets: AssetWithRole[]
  stops: StopWithAssets[]
}

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
 * Get a guide by nanoId with all its translations and stops with assets
 */
export async function getGuideByNanoId(db: DB, nanoId: string): Promise<GuideWithStops | null> {
  const result = await db.query.guide.findFirst({
    where: and(eq(guide.nanoId, nanoId), isNull(guide.archivedAt), isNull(guide.deletedAt)),
    with: {
      translations: {
        with: {
          currentVersion: true,
          draftVersion: true,
        },
      },
      stops: {
        with: {
          translations: {
            with: {
              currentVersion: true,
              draftVersion: true,
            },
          },
        },
        orderBy: asc(stop.order),
      },
    },
  })

  return result ?? null
}

/**
 * Get all guides with their translations
 */
export async function getAllGuides(db: DB): Promise<GuideWithTranslations[]> {
  const result = await db.query.guide.findMany({
    where: and(isNull(guide.archivedAt), isNull(guide.deletedAt)),
    with: {
      translations: true,
    },
  })

  return result
}

/**
 * Get all guides created by a specific user with their translations
 */
export async function getGuidesByUserId(db: DB, userId: string): Promise<GuideWithTranslations[]> {
  const result = await db.query.guide.findMany({
    where: and(eq(guide.createdBy, userId), isNull(guide.archivedAt), isNull(guide.deletedAt)),
    with: {
      translations: true,
    },
  })

  return result
}

/**
 * Get a guide with only a specific locale translation (with current version)
 */
export async function getGuideByIdWithLocale(
  db: DB,
  guideId: string,
  locale: SupportedLocale,
): Promise<(typeof guide.$inferSelect & { translation?: any }) | null> {
  const result = await db.query.guide.findFirst({
    where: and(eq(guide.id, guideId), isNull(guide.archivedAt), isNull(guide.deletedAt)),
    with: {
      translations: {
        where: eq(guideTranslation.locale, locale),
        limit: 1,
        with: {
          currentVersion: true,
        },
      },
    },
  })

  if (!result) return null

  return {
    ...result,
    translation: result.translations[0],
  }
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
        nanoId: guideData.nanoId ?? nanoid(),
      })
      .returning()

    if (!newGuide) {
      throw new Error('Failed to create guide')
    }

    // Insert translations
    const translationsWithGuideId = translations.map((t) => ({
      ...t,
      guideId: newGuide.id,
    }))

    const newTranslations = await tx.insert(guideTranslation).values(translationsWithGuideId).returning()

    return {
      ...newGuide,
      translations: newTranslations,
    }
  })
}

/**
 * Get archived guides for a specific user
 */
export async function getArchivedGuides(db: DB, userId: string): Promise<GuideWithTranslations[]> {
  return db.query.guide.findMany({
    where: and(eq(guide.createdBy, userId), isNotNull(guide.archivedAt), isNull(guide.deletedAt)),
    with: {
      translations: true,
    },
    orderBy: [desc(guide.archivedAt)],
  })
}

/**
 * Update a guide translation for a specific locale
 * Creates a new translation if one doesn't exist
 */
export async function updateGuideTranslation(
  db: DB,
  guideId: string,
  locale: string,
  data: { title?: string; description?: string },
): Promise<typeof guideTranslation.$inferSelect> {
  const existing = await db.query.guideTranslation.findFirst({
    where: and(eq(guideTranslation.guideId, guideId), eq(guideTranslation.locale, locale)),
  })

  // Use new versioning system - create/update draft
  const { upsertGuideTranslationDraft } = await import('./translation-mutations')
  
  if (!data.title) {
    throw new Error('Title is required')
  }

  const versionId = await upsertGuideTranslationDraft(
    guideId,
    locale,
    { title: data.title, description: data.description },
  )

  return { versionId } as any
}

/**
 * Get a published guide by nanoId with all assets for the app viewer
 */
export async function getPublishedGuideByNanoId(db: DB, nanoId: string): Promise<GuideWithStopsAndAssets | null> {
  const result = await db.query.guide.findFirst({
    where: and(
      eq(guide.nanoId, nanoId),
      isNull(guide.deletedAt),
      isNull(guide.archivedAt),
      isNotNull(guide.published),
    ),
    with: {
      translations: true,
      stops: {
        with: {
          translations: true,
        },
        orderBy: asc(stop.order),
      },
    },
  })

  if (!result) return null

  // Fetch guide assets
  const guideAssets = await db
    .select({
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
  const stopIds = result.stops.map((s: any) => s.id)
  const stopAssetsData =
    stopIds.length > 0
      ? await db
          .select({
            stopId: stopAsset.stopId,
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
  for (const item of stopAssetsData as any) {
    if (!stopAssetsMap.has(item.stopId)) {
      stopAssetsMap.set(item.stopId, [])
    }
    stopAssetsMap.get(item.stopId)?.push({
      ...item.asset,
      role: item.role,
      order: item.order,
      locale: item.locale,
    })
  }

  return {
    ...result,
    assets: guideAssets.map((item: any) => ({
      ...item.asset,
      role: item.role,
      order: item.order,
      locale: item.locale,
    })),
    stops: result.stops.map((s: any) => ({
      ...s,
      assets: stopAssetsMap.get(s.id) || [],
    })),
  }
}

/**
 * Get a stop by nanoId with all its assets for the app viewer
 */
export async function getStopByNanoId(db: DB, stopNanoId: string): Promise<StopWithAssets | null> {
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
    assets: stopAssets.map((item: any) => ({
      ...item.asset,
      role: item.role,
      order: item.order,
      locale: item.locale,
    })),
  }
}

/**
 * Get guide ID by stop nanoId
 */
export async function getGuideIdByStopNanoId(db: DB, stopNanoId: string): Promise<string | null> {
  const result = await db.query.stop.findFirst({
    where: eq(stop.nanoId, stopNanoId),
    columns: {
      guideId: true,
    },
  })

  return result?.guideId ?? null
}
