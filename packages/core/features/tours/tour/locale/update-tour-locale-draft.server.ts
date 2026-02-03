import { and, eq } from 'drizzle-orm'
import { NotFoundError } from '../../../auth/authorization'
import { db } from '../../../db'
import { tour, tourLocaleDraft } from '../../schema'

// =============================================================================
// TYPES
// =============================================================================

export type UpdateTourLocaleDraftInput = {
  title?: string | null
  description?: string | null
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function updateTourLocaleDraft(
  tourNanoId: string,
  locale: string,
  input: UpdateTourLocaleDraftInput,
  userId: string,
): Promise<void> {
  const [foundTour] = await db.select({ id: tour.id }).from(tour).where(eq(tour.nanoId, tourNanoId)).limit(1)

  if (!foundTour) {
    throw new NotFoundError('Tour')
  }

  const updateData: Record<string, unknown> = {
    updatedBy: userId,
  }

  if (input.title !== undefined) updateData.title = input.title
  if (input.description !== undefined) updateData.description = input.description

  const result = await db
    .update(tourLocaleDraft)
    .set(updateData)
    .where(and(eq(tourLocaleDraft.tourId, foundTour.id), eq(tourLocaleDraft.locale, locale)))
    .returning({ id: tourLocaleDraft.id })

  if (result.length === 0) {
    throw new NotFoundError('Tour locale draft')
  }
}
