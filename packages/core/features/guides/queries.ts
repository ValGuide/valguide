import { eq, and, asc, isNull } from 'drizzle-orm'
import type { DB } from '../db'
import {
  guide,
  guideTranslation,
  stop,
  stopTranslation,
  type GuideWithTranslations,
  type GuideWithStops,
} from './schema'
import type { SupportedLocale } from '../../i18n/i18n.config'
import { customAlphabet } from 'nanoid'

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 10)

/**
 * Query utilities for guides with i18n support
 */

/**
 * Get a guide by ID with all its translations
 */
export async function getGuideById(db: DB, guideId: string): Promise<GuideWithTranslations | null> {
  const result = await db.query.guide.findFirst({
    where: and(eq(guide.id, guideId), isNull(guide.deletedAt)),
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
    where: and(eq(guide.nanoId, nanoId), isNull(guide.deletedAt)),
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

  return result ?? null
}

/**
 * Get all guides with their translations
 */
export async function getAllGuides(db: DB): Promise<GuideWithTranslations[]> {
  const result = await db.query.guide.findMany({
    where: isNull(guide.deletedAt),
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
    where: and(eq(guide.createdBy, userId), isNull(guide.deletedAt)),
    with: {
      translations: true,
    },
  })

  return result
}

/**
 * Get a guide with only a specific locale translation
 */
export async function getGuideByIdWithLocale(
  db: DB,
  guideId: string,
  locale: SupportedLocale,
): Promise<(typeof guide.$inferSelect & { translation?: typeof guideTranslation.$inferSelect }) | null> {
  const result = await db.query.guide.findFirst({
    where: and(eq(guide.id, guideId), isNull(guide.deletedAt)),
    with: {
      translations: {
        where: eq(guideTranslation.locale, locale),
        limit: 1,
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

  if (existing) {
    // Update existing translation
    const [updated] = await db
      .update(guideTranslation)
      .set(data)
      .where(and(eq(guideTranslation.guideId, guideId), eq(guideTranslation.locale, locale)))
      .returning()

    if (!updated) {
      throw new Error('Failed to update translation')
    }
    return updated
  } else {
    // Create new translation
    const [created] = await db
      .insert(guideTranslation)
      .values({
        guideId,
        locale,
        title: data.title ?? '',
        description: data.description,
      })
      .returning()

    if (!created) {
      throw new Error('Failed to create translation')
    }
    return created
  }
}
