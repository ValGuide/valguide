import { valguideId } from '../../../utils/nanoid'
import { db } from '../../db'
import { stop, stopLocale, stopLocaleDraft, stopSettingsDraft } from '../schema'

// =============================================================================
// TYPES
// =============================================================================

export type CreateStopInput = {
  title: string
  locale?: string
}

export type CreateStopResult = {
  nanoId: string
  locale: string
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function createStop(
  input: CreateStopInput,
  organizationId: string,
  userId: string,
): Promise<CreateStopResult> {
  const locale = input.locale ?? 'en'

  return db.transaction(async (tx) => {
    const nanoId = valguideId()

    const [newStop] = await tx
      .insert(stop)
      .values({
        nanoId,
        organizationId,
        createdBy: userId,
        updatedBy: userId,
        availableLocales: [locale],
      })
      .returning()

    const [draft] = await tx
      .insert(stopLocaleDraft)
      .values({
        stopLocaleId: newStop.id,
        title: input.title,
        updatedBy: userId,
      })
      .returning()

    await tx.insert(stopLocale).values({
      stopId: newStop.id,
      locale,
      draftId: draft.id,
    })

    await tx.insert(stopSettingsDraft).values({
      stopId: newStop.id,
      updatedBy: userId,
    })

    return { nanoId, locale }
  })
}
