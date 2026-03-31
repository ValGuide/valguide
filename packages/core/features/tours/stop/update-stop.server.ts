import { and, eq, inArray } from 'drizzle-orm'
import { NotFoundError } from '../../auth/authorization'
import { db } from '../../db'
import { stop, stopLocaleDraft } from '../schema'

// =============================================================================
// TYPES
// =============================================================================

export type UpdateStopInput = {
  availableLocales?: string[]
}

export type UpdateStopResult = {
  nanoId: string
  availableLocales: string[]
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function updateStop(stopId: string, input: UpdateStopInput, userId: string): Promise<UpdateStopResult> {
  return db.transaction(async (tx) => {
    const [current] = await tx
      .select({ availableLocales: stop.availableLocales })
      .from(stop)
      .where(eq(stop.id, stopId))
      .limit(1)

    if (!current) {
      throw new NotFoundError('Stop')
    }

    const currentLocales = current.availableLocales ?? []
    const nextLocales = input.availableLocales ?? currentLocales
    const addedLocales = nextLocales.filter((locale) => !currentLocales.includes(locale))
    const removedLocales = currentLocales.filter((locale) => !nextLocales.includes(locale))

    if (addedLocales.length > 0) {
      for (const locale of addedLocales) {
        const [existingDraft] = await tx
          .select({ id: stopLocaleDraft.id })
          .from(stopLocaleDraft)
          .where(and(eq(stopLocaleDraft.stopId, stopId), eq(stopLocaleDraft.locale, locale)))
          .limit(1)

        if (!existingDraft) {
          await tx.insert(stopLocaleDraft).values({
            stopId,
            locale,
            updatedBy: userId,
          })
        }
      }
    }

    if (removedLocales.length > 0) {
      await tx
        .delete(stopLocaleDraft)
        .where(and(eq(stopLocaleDraft.stopId, stopId), inArray(stopLocaleDraft.locale, removedLocales)))
    }

    const [updated] = await tx
      .update(stop)
      .set({
        availableLocales: nextLocales,
        updatedBy: userId,
      })
      .where(eq(stop.id, stopId))
      .returning({
        nanoId: stop.nanoId,
        availableLocales: stop.availableLocales,
      })

    if (!updated) {
      throw new NotFoundError('Stop')
    }

    return {
      nanoId: updated.nanoId,
      availableLocales: updated.availableLocales ?? [],
    }
  })
}
