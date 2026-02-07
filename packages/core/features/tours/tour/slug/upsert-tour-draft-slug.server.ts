import { and, eq, isNull } from 'drizzle-orm'
import { slugSchema } from '../../../../utils/slug'
import type { DB } from '../../../db'
import { isUniqueViolation } from '../../../links/utils'
import { tourSlug } from '../../schema'
import { checkTourSlugAvailable } from './check-tour-slug-available.server'

export type UpsertTourDraftSlugResult =
  | { success: true }
  | { success: false; error: 'SLUG_TAKEN'; message: string }
  | { success: false; error: 'VALIDATION_ERROR'; message: string }

export async function upsertTourDraftSlug(
  db: DB,
  tourId: string,
  organizationId: string,
  newSlug: string,
): Promise<UpsertTourDraftSlugResult> {
  const validation = slugSchema.safeParse(newSlug)
  if (!validation.success) {
    return {
      success: false,
      error: 'VALIDATION_ERROR',
      message: validation.error.errors[0]?.message ?? 'Invalid slug',
    }
  }

  const availability = await checkTourSlugAvailable(db, newSlug, organizationId, tourId)
  if (!availability.available && availability.takenBy !== 'self' && availability.takenBy !== 'selfDraft') {
    return {
      success: false,
      error: 'SLUG_TAKEN',
      message:
        availability.takenBy === 'reserved' ? 'This slug is reserved' : 'You already used this slug for another tour',
    }
  }

  try {
    const existingDraft = await db.query.tourSlug.findFirst({
      where: and(eq(tourSlug.tourId, tourId), isNull(tourSlug.publishedAt)),
      columns: { id: true },
    })

    if (existingDraft) {
      await db.update(tourSlug).set({ slug: newSlug }).where(eq(tourSlug.id, existingDraft.id))
    } else {
      await db.insert(tourSlug).values({
        tourId,
        organizationId,
        slug: newSlug,
        isPrimary: false,
        publishedAt: null,
      })
    }

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
