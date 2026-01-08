import { asc, desc, eq } from 'drizzle-orm'
import { valguideId } from '../../utils/nanoid'
import { db } from '../db'
import { guide, guideStop, stop, stopTranslation } from './schema'

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
