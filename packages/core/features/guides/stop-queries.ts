import { db } from '../db'
import { stop, stopTranslation, type Stop, type StopTranslation, type NewStop } from './schema'
import { eq, and, asc } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import type { SupportedLocale } from '../../i18n/i18n.config'

export async function getStopById(stopId: string) {
  return await db.query.stop.findFirst({
    where: eq(stop.id, stopId),
    with: {
      translations: true,
      assets: {
        with: {
          asset: true,
        },
      },
    },
  })
}

export async function getStopByNanoId(nanoId: string) {
  return await db.query.stop.findFirst({
    where: eq(stop.nanoId, nanoId),
    with: {
      translations: true,
      assets: {
        with: {
          asset: true,
        },
      },
    },
  })
}

export async function getGuideStops(guideId: string) {
  return await db.query.stop.findMany({
    where: eq(stop.guideId, guideId),
    with: {
      translations: true,
      assets: {
        with: {
          asset: true,
        },
      },
    },
    orderBy: [asc(stop.order)],
  })
}

export async function createStop({
  guideId,
  userId,
  translations,
  order = 0,
}: {
  guideId: string
  userId: string
  translations: Array<{ locale: string; title: string; description?: string; transcription?: string }>
  order?: number
}) {
  return await db.transaction(async (tx) => {
    // Create stop
    const [newStop] = await tx
      .insert(stop)
      .values({
        guideId,
        nanoId: nanoid(21),
        order,
        createdBy: userId,
      })
      .returning()

    // Create translations
    const newTranslations = await tx
      .insert(stopTranslation)
      .values(
        translations.map((t) => ({
          stopId: newStop.id,
          locale: t.locale,
          title: t.title,
          description: t.description || null,
          transcription: t.transcription || null,
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
  const existing = await db.query.stopTranslation.findFirst({
    where: and(eq(stopTranslation.stopId, stopId), eq(stopTranslation.locale, locale)),
  })

  if (existing) {
    // Update existing translation
    const [updated] = await db
      .update(stopTranslation)
      .set(data)
      .where(eq(stopTranslation.id, existing.id))
      .returning()
    return updated
  } else {
    // Insert new translation
    const [created] = await db
      .insert(stopTranslation)
      .values({
        stopId,
        locale,
        title: data.title || '',
        description: data.description || null,
        transcription: data.transcription || null,
      })
      .returning()
    return created
  }
}

export async function updateStopOrder(stopId: string, order: number) {
  const [updated] = await db.update(stop).set({ order }).where(eq(stop.id, stopId)).returning()
  return updated
}

export async function reorderStops(updates: Array<{ id: string; order: number }>) {
  return await db.transaction(async (tx) => {
    const results = []
    for (const update of updates) {
      const [result] = await tx.update(stop).set({ order: update.order }).where(eq(stop.id, update.id)).returning()
      results.push(result)
    }
    return results
  })
}

export async function deleteStop(stopId: string) {
  await db.delete(stop).where(eq(stop.id, stopId))
  return { success: true }
}

export function getLocalizedStopText(
  stop: { translations: StopTranslation[] },
  field: 'title' | 'description' | 'transcription',
  locale: SupportedLocale,
  fallbackLocale: SupportedLocale = 'en',
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
