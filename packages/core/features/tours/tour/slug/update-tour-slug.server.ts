import { eq } from 'drizzle-orm'
import { slugSchema } from '../../../../utils/slug'
import type { DB } from '../../../db'
import { isUniqueViolation } from '../../../links/utils'
import { tourSlug } from '../../schema'
import { checkTourSlugAvailable } from './check-tour-slug-available.server'

export type UpdateTourSlugResult =
  | { success: true }
  | { success: false; error: 'SLUG_TAKEN'; message: string }
  | { success: false; error: 'VALIDATION_ERROR'; message: string }

export async function updateTourSlug(
  db: DB,
  tourId: string,
  organizationId: string,
  newSlug: string,
): Promise<UpdateTourSlugResult> {
  const validation = slugSchema.safeParse(newSlug)
  if (!validation.success) {
    return {
      success: false,
      error: 'VALIDATION_ERROR',
      message: validation.error.errors[0]?.message ?? 'Invalid slug',
    }
  }

  const availability = await checkTourSlugAvailable(db, newSlug, organizationId, tourId)
  if (!availability.available && availability.takenBy !== 'self') {
    return {
      success: false,
      error: 'SLUG_TAKEN',
      message:
        availability.takenBy === 'reserved' ? 'This slug is reserved' : 'You already used this slug for another tour',
    }
  }

  try {
    await db.transaction(async (tx) => {
      await tx.update(tourSlug).set({ isPrimary: false }).where(eq(tourSlug.tourId, tourId))

      await tx
        .insert(tourSlug)
        .values({
          tourId,
          organizationId,
          slug: newSlug,
          isPrimary: true,
        })
        .onConflictDoUpdate({
          target: [tourSlug.organizationId, tourSlug.slug],
          set: { isPrimary: true },
        })
    })

    return { success: true }
  } catch (err) {
    if (isUniqueViolation(err)) {
      return {
        success: false,
        error: 'SLUG_TAKEN',
        message: 'You already used this slug for another tour',
      }
    }
    throw err
  }
}
