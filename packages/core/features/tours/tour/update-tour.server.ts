import { and, eq, inArray } from 'drizzle-orm'
import { NotFoundError, requireTourAccessByNanoId } from '../../auth/authorization'
import { db } from '../../db'
import { stopLocaleDraft, tour, tourLocaleDraft, tourStopDraft } from '../schema'

// =============================================================================
// TYPES
// =============================================================================

export type UpdateTourInput = {
  nanoId: string
  availableLocales?: string[]
  addLocale?: string
  removeLocale?: string
}

export type UpdateTourResult = {
  nanoId: string
  availableLocales: string[]
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function updateTour(input: UpdateTourInput, userId: string): Promise<UpdateTourResult> {
  const { tourId } = await requireTourAccessByNanoId(input.nanoId, userId)

  return db.transaction(async (tx) => {
    const updateData: Partial<{ availableLocales: string[]; updatedBy: string }> = {
      updatedBy: userId,
    }

    if (input.availableLocales) {
      const [current] = await tx
        .select({ availableLocales: tour.availableLocales })
        .from(tour)
        .where(eq(tour.id, tourId))
        .limit(1)

      const currentLocales = current?.availableLocales ?? []
      const nextLocales = input.availableLocales
      updateData.availableLocales = nextLocales

      const addedLocales = nextLocales.filter((locale) => !currentLocales.includes(locale))
      const removedLocales = currentLocales.filter((locale) => !nextLocales.includes(locale))

      for (const locale of addedLocales) {
        const existingDraft = await tx.query.tourLocaleDraft.findFirst({
          where: and(eq(tourLocaleDraft.tourId, tourId), eq(tourLocaleDraft.locale, locale)),
        })

        if (!existingDraft) {
          await tx.insert(tourLocaleDraft).values({
            tourId,
            locale,
            updatedBy: userId,
          })
        }
      }

      if (addedLocales.length > 0) {
        const tourStops = await tx
          .select({ stopId: tourStopDraft.stopId })
          .from(tourStopDraft)
          .where(eq(tourStopDraft.tourId, tourId))

        for (const { stopId } of tourStops) {
          for (const locale of addedLocales) {
            const existingStopDraft = await tx.query.stopLocaleDraft.findFirst({
              where: and(eq(stopLocaleDraft.stopId, stopId), eq(stopLocaleDraft.locale, locale)),
            })

            if (!existingStopDraft) {
              await tx.insert(stopLocaleDraft).values({
                stopId,
                locale,
                updatedBy: userId,
              })
            }
          }
        }
      }

      if (removedLocales.length > 0) {
        await tx
          .delete(tourLocaleDraft)
          .where(and(eq(tourLocaleDraft.tourId, tourId), inArray(tourLocaleDraft.locale, removedLocales)))
      }
    }

    if (input.addLocale) {
      const [current] = await tx
        .select({ availableLocales: tour.availableLocales })
        .from(tour)
        .where(eq(tour.id, tourId))
        .limit(1)

      const locales = current?.availableLocales ?? []
      if (!locales.includes(input.addLocale)) {
        updateData.availableLocales = [...locales, input.addLocale]

        const existingDraft = await tx.query.tourLocaleDraft.findFirst({
          where: and(eq(tourLocaleDraft.tourId, tourId), eq(tourLocaleDraft.locale, input.addLocale)),
        })

        if (!existingDraft) {
          await tx.insert(tourLocaleDraft).values({
            tourId,
            locale: input.addLocale,
            updatedBy: userId,
          })
        }

        const tourStops = await tx
          .select({ stopId: tourStopDraft.stopId })
          .from(tourStopDraft)
          .where(eq(tourStopDraft.tourId, tourId))

        for (const { stopId } of tourStops) {
          const existingStopDraft = await tx.query.stopLocaleDraft.findFirst({
            where: and(eq(stopLocaleDraft.stopId, stopId), eq(stopLocaleDraft.locale, input.addLocale)),
          })
          if (!existingStopDraft) {
            await tx.insert(stopLocaleDraft).values({
              stopId,
              locale: input.addLocale,
              updatedBy: userId,
            })
          }
        }
      }
    }

    if (input.removeLocale) {
      const [current] = await tx
        .select({ availableLocales: tour.availableLocales })
        .from(tour)
        .where(eq(tour.id, tourId))
        .limit(1)

      const locales = current?.availableLocales ?? []
      updateData.availableLocales = locales.filter((l) => l !== input.removeLocale)

      await tx
        .delete(tourLocaleDraft)
        .where(and(eq(tourLocaleDraft.tourId, tourId), eq(tourLocaleDraft.locale, input.removeLocale)))
    }

    const [updated] = await tx
      .update(tour)
      .set(updateData)
      .where(eq(tour.id, tourId))
      .returning({ nanoId: tour.nanoId, availableLocales: tour.availableLocales })

    if (!updated) {
      throw new NotFoundError('Tour')
    }

    return {
      nanoId: updated.nanoId,
      availableLocales: updated.availableLocales ?? [],
    }
  })
}
