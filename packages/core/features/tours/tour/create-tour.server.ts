import { eq } from 'drizzle-orm'
import { valguideId } from '../../../utils/nanoid'
import { db } from '../../db'
import { tour, tourLocaleDraft, tourSettingsDraft } from '../schema'

// =============================================================================
// TYPES
// =============================================================================

export type CreateTourInput = {
  nanoId?: string
  title?: string
  locale?: string
}

export type CreateTourResult = {
  nanoId: string
  locale: string
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function createTour(
  input: CreateTourInput,
  organizationId: string,
  userId: string,
): Promise<CreateTourResult> {
  const locale = input.locale ?? 'en'
  const nanoId = input.nanoId ?? valguideId()

  // Check if tour with this nanoId already exists (idempotent creation)
  if (input.nanoId) {
    const existing = await db.query.tour.findFirst({
      where: eq(tour.nanoId, input.nanoId),
    })
    if (existing) {
      return { nanoId: existing.nanoId, locale }
    }
  }

  return db.transaction(async (tx) => {
    const [newTour] = await tx
      .insert(tour)
      .values({
        nanoId,
        organizationId,
        createdBy: userId,
        updatedBy: userId,
        availableLocales: [locale],
      })
      .returning()

    await tx.insert(tourLocaleDraft).values({
      tourId: newTour.id,
      locale,
      title: input.title,
      updatedBy: userId,
    })

    await tx.insert(tourSettingsDraft).values({
      tourId: newTour.id,
      updatedBy: userId,
    })

    return { nanoId, locale }
  })
}
