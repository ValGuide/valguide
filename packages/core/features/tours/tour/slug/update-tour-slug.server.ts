import { eq } from 'drizzle-orm'
import { slugSchema } from '../../../../utils/slug'
import type { DB } from '../../../db'
import { isUniqueViolation } from '../../../links/utils'
import { organization } from '../../../orgs/schema'
import { tour, tourSlug } from '../../schema'
import { checkTourSlugAvailable } from './check-tour-slug-available.server'

export type UpdateTourSlugResult =
  | { success: true; tourNanoId: string; oldSlug: string; orgSlug: string }
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
    let oldSlug = ''
    let tourNanoId = ''
    let orgSlug = ''

    await db.transaction(async (tx) => {
      // Read current slug + nanoId, and org slug for KV cache keys
      const [[current], [org]] = await Promise.all([
        tx.select({ slug: tour.slug, nanoId: tour.nanoId }).from(tour).where(eq(tour.id, tourId)).limit(1),
        tx.select({ slug: organization.slug }).from(organization).where(eq(organization.id, organizationId)).limit(1),
      ])

      if (current) {
        oldSlug = current.slug
        tourNanoId = current.nanoId
      }
      if (org) {
        orgSlug = org.slug
      }

      // Insert old slug into redirect table (if different)
      if (current && current.slug !== newSlug) {
        await tx.insert(tourSlug).values({
          tourId,
          organizationId,
          slug: current.slug,
        })
      }

      // Update canonical slug
      await tx.update(tour).set({ slug: newSlug }).where(eq(tour.id, tourId))
    })

    return { success: true, tourNanoId, oldSlug, orgSlug }
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
