import { and, asc, desc, eq } from 'drizzle-orm'
import type { SupportedLocale } from '../../i18n/i18n.config'
import { valguideId } from '../../utils/nanoid'
import { db } from '../db'
import { guide, guideStop, stop, stopTranslation } from './schema'

export async function getStopsByOrganizationId(organizationId: string) {
  return await db.query.stop.findMany({
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

export async function getStopById(stopId: string) {
  return await db.query.stop.findFirst({
    where: eq(stop.id, stopId),
    with: {
      translations: true,
    },
  })
}

export async function getStopByNanoId(nanoId: string) {
  return await db.query.stop.findFirst({
    where: eq(stop.nanoId, nanoId),
    with: {
      translations: true,
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
 * @deprecated Use getGuideStopsOrdered which uses the junction table
 */
export async function getGuideStops(guideId: string) {
  return await db.query.stop.findMany({
    where: eq(stop.guideId, guideId),
    with: {
      translations: true,
    },
    orderBy: [asc(stop.order)],
  })
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
  translations: Array<{ locale: string; title: string; description?: string; transcription?: string }>
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

    // Add to junction table
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

export async function updateStopTranslation(
  stopId: string,
  locale: string,
  data: { title?: string; description?: string; transcription?: string },
) {
  // Use new versioning system - create/update draft
  const { upsertStopTranslationDraft } = await import('./translation-mutations')

  if (!data.title) {
    throw new Error('Title is required')
  }

  const versionId = await upsertStopTranslationDraft(stopId, locale, {
    title: data.title,
    description: data.description || null,
    transcription: data.transcription || null,
  })

  return { versionId }
}

/**
 * @deprecated Use reorderGuideStops which uses the junction table
 */
export async function updateStopOrder(stopId: string, order: number) {
  const [updated] = await db.update(stop).set({ order }).where(eq(stop.id, stopId)).returning()
  return updated
}

/**
 * @deprecated Use reorderGuideStops which uses the junction table
 */
export async function reorderStops(updates: Array<{ id: string; order: number }>) {
  return await db.transaction(async (tx: typeof db) => {
    const results = []
    for (const update of updates) {
      const [result] = await tx.update(stop).set({ order: update.order }).where(eq(stop.id, update.id)).returning()
      results.push(result)
    }
    return results
  })
}

/**
 * Reorder stops in a guide by providing ordered array of stop IDs
 * Uses the junction table for ordering
 */
export async function reorderGuideStops(guideId: string, stopIds: string[]) {
  return await db.transaction(async (tx: typeof db) => {
    // Delete all positions for this guide
    await tx.delete(guideStop).where(eq(guideStop.guideId, guideId))

    // Re-insert with new positions
    if (stopIds.length > 0) {
      await tx.insert(guideStop).values(
        stopIds.map((stopId, index) => ({
          guideId,
          stopId,
          position: index,
        })),
      )
    }

    // Also update deprecated order column for backward compatibility
    for (let i = 0; i < stopIds.length; i++) {
      await tx.update(stop).set({ order: i }).where(eq(stop.id, stopIds[i]!))
    }
  })
}

/**
 * Add a stop to a guide at a specific position
 */
export async function addStopToGuide(guideId: string, stopId: string, position?: number) {
  return await db.transaction(async (tx: typeof db) => {
    // Check if already in guide
    const existing = await tx.query.guideStop.findFirst({
      where: eq(guideStop.guideId, guideId),
    })

    if (existing) {
      throw new Error('Stop is already in this guide')
    }

    // Determine position
    let finalPosition = position
    if (finalPosition === undefined) {
      const maxPositionResult = await tx
        .select({ maxPos: guideStop.position })
        .from(guideStop)
        .where(eq(guideStop.guideId, guideId))
      const maxPosition = maxPositionResult.length > 0 ? Math.max(...maxPositionResult.map((r) => r.maxPos)) : -1
      finalPosition = maxPosition + 1
    }

    // Add to junction table
    const [newGuideStop] = await tx
      .insert(guideStop)
      .values({
        guideId,
        stopId,
        position: finalPosition,
      })
      .returning()

    return newGuideStop
  })
}

/**
 * Remove a stop from a guide (does NOT delete the stop itself)
 */
export async function removeStopFromGuide(guideId: string, stopId: string) {
  await db.delete(guideStop).where(and(eq(guideStop.guideId, guideId), eq(guideStop.stopId, stopId)))

  return { success: true }
}

export async function deleteStop(stopId: string) {
  await db.delete(stop).where(eq(stop.id, stopId))
  return { success: true }
}

export function getLocalizedStopText(
  stop: { translations: any[] },
  field: 'title' | 'description' | 'transcription',
  locale: SupportedLocale,
  fallbackLocale: SupportedLocale = 'en',
): string {
  // Now works with versioned translations
  const translation = stop.translations.find((t) => t.locale === locale)
  if (translation?.currentVersion?.[field]) {
    return translation.currentVersion[field] || ''
  }

  const fallbackTranslation = stop.translations.find((t) => t.locale === fallbackLocale)
  if (fallbackTranslation?.currentVersion?.[field]) {
    return fallbackTranslation.currentVersion[field] || ''
  }

  const firstTranslation = stop.translations[0]
  return firstTranslation?.currentVersion?.[field] || ''
}
