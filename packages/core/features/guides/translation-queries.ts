import { eq, and, desc } from 'drizzle-orm'
import { db } from '../db'
import {
  guideTranslation,
  guideTranslationVersion,
  stopTranslation,
  stopTranslationVersion,
  type GuideTranslationVersion,
  type StopTranslationVersion,
  type GuideTranslationWithVersion,
  type StopTranslationWithVersion,
} from './schema'

/**
 * Get current published translation version for a guide
 */
export async function getCurrentGuideTranslation(
  guideId: string,
  locale: string,
): Promise<GuideTranslationVersion | null> {
  const result = await db
    .select({
      version: guideTranslationVersion,
    })
    .from(guideTranslation)
    .innerJoin(
      guideTranslationVersion,
      eq(guideTranslation.currentVersionId, guideTranslationVersion.id),
    )
    .where(and(eq(guideTranslation.guideId, guideId), eq(guideTranslation.locale, locale)))
    .limit(1)

  return result[0]?.version || null
}

/**
 * Get draft translation version for a guide
 */
export async function getDraftGuideTranslation(
  guideId: string,
  locale: string,
): Promise<GuideTranslationVersion | null> {
  const result = await db
    .select({
      version: guideTranslationVersion,
    })
    .from(guideTranslation)
    .innerJoin(guideTranslationVersion, eq(guideTranslation.draftVersionId, guideTranslationVersion.id))
    .where(and(eq(guideTranslation.guideId, guideId), eq(guideTranslation.locale, locale)))
    .limit(1)

  return result[0]?.version || null
}

/**
 * Get all translation versions for a guide locale (for history view)
 */
export async function getGuideTranslationHistory(
  guideId: string,
  locale: string,
): Promise<GuideTranslationVersion[]> {
  const translation = await db
    .select()
    .from(guideTranslation)
    .where(and(eq(guideTranslation.guideId, guideId), eq(guideTranslation.locale, locale)))
    .limit(1)

  if (!translation[0]) {
    return []
  }

  const versions = await db
    .select()
    .from(guideTranslationVersion)
    .where(eq(guideTranslationVersion.translationId, translation[0].id))
    .orderBy(desc(guideTranslationVersion.version))

  return versions
}

/**
 * Get guide translation with current and draft versions
 */
export async function getGuideTranslationWithVersions(
  guideId: string,
  locale: string,
): Promise<GuideTranslationWithVersion | null> {
  const result = await db.query.guideTranslation.findFirst({
    where: and(eq(guideTranslation.guideId, guideId), eq(guideTranslation.locale, locale)),
    with: {
      currentVersion: true,
      draftVersion: true,
      versions: {
        orderBy: (versions: any, { desc }: any) => [desc(versions.version)],
      },
    },
  })

  return result || null
}

/**
 * Get all translations for a guide with their current versions
 */
export async function getGuideTranslations(guideId: string): Promise<GuideTranslationWithVersion[]> {
  const translations = await db.query.guideTranslation.findMany({
    where: eq(guideTranslation.guideId, guideId),
    with: {
      currentVersion: true,
      draftVersion: true,
    },
  })

  return translations
}

/**
 * Get current published translation version for a stop
 */
export async function getCurrentStopTranslation(
  stopId: string,
  locale: string,
): Promise<StopTranslationVersion | null> {
  const result = await db
    .select({
      version: stopTranslationVersion,
    })
    .from(stopTranslation)
    .innerJoin(stopTranslationVersion, eq(stopTranslation.currentVersionId, stopTranslationVersion.id))
    .where(and(eq(stopTranslation.stopId, stopId), eq(stopTranslation.locale, locale)))
    .limit(1)

  return result[0]?.version || null
}

/**
 * Get draft translation version for a stop
 */
export async function getDraftStopTranslation(
  stopId: string,
  locale: string,
): Promise<StopTranslationVersion | null> {
  const result = await db
    .select({
      version: stopTranslationVersion,
    })
    .from(stopTranslation)
    .innerJoin(stopTranslationVersion, eq(stopTranslation.draftVersionId, stopTranslationVersion.id))
    .where(and(eq(stopTranslation.stopId, stopId), eq(stopTranslation.locale, locale)))
    .limit(1)

  return result[0]?.version || null
}

/**
 * Get all translation versions for a stop locale (for history view)
 */
export async function getStopTranslationHistory(
  stopId: string,
  locale: string,
): Promise<StopTranslationVersion[]> {
  const translation = await db
    .select()
    .from(stopTranslation)
    .where(and(eq(stopTranslation.stopId, stopId), eq(stopTranslation.locale, locale)))
    .limit(1)

  if (!translation[0]) {
    return []
  }

  const versions = await db
    .select()
    .from(stopTranslationVersion)
    .where(eq(stopTranslationVersion.translationId, translation[0].id))
    .orderBy(desc(stopTranslationVersion.version))

  return versions
}

/**
 * Get stop translation with current and draft versions
 */
export async function getStopTranslationWithVersions(
  stopId: string,
  locale: string,
): Promise<StopTranslationWithVersion | null> {
  const result = await db.query.stopTranslation.findFirst({
    where: and(eq(stopTranslation.stopId, stopId), eq(stopTranslation.locale, locale)),
    with: {
      currentVersion: true,
      draftVersion: true,
      versions: {
        orderBy: (versions: any, { desc }: any) => [desc(versions.version)],
      },
    },
  })

  return result || null
}

/**
 * Get all translations for a stop with their current versions
 */
export async function getStopTranslations(stopId: string): Promise<StopTranslationWithVersion[]> {
  const translations = await db.query.stopTranslation.findMany({
    where: eq(stopTranslation.stopId, stopId),
    with: {
      currentVersion: true,
      draftVersion: true,
    },
  })

  return translations
}
