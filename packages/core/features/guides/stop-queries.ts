import { asc, eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import type { SupportedLocale } from '../../i18n/i18n.config'
import { db } from '../db'
import { stop, stopTranslation } from './schema'

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

export async function getGuideStops(guideId: string) {
  return await db.query.stop.findMany({
    where: eq(stop.guideId, guideId),
    with: {
      translations: true,
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
  return await db.transaction(async (tx: typeof db) => {
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

    if (!newStop) {
      throw new Error('Failed to create stop')
    }

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

export async function updateStopOrder(stopId: string, order: number) {
  const [updated] = await db.update(stop).set({ order }).where(eq(stop.id, stopId)).returning()
  return updated
}

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
