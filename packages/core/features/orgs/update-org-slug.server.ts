import { eq } from 'drizzle-orm'
import { slugSchema } from '../../utils/slug'
import type { DB } from '../db'
import { isUniqueViolation } from '../links/utils'
import { checkOrgSlugAvailable } from './check-org-slug-available.server'
import { organizationSlug } from './schema'

export type UpdateOrgSlugResult =
  | { success: true }
  | { success: false; error: 'SLUG_TAKEN'; message: string }
  | { success: false; error: 'VALIDATION_ERROR'; message: string }

export async function updateOrgSlug(db: DB, organizationId: string, newSlug: string): Promise<UpdateOrgSlugResult> {
  const validation = slugSchema.safeParse(newSlug)
  if (!validation.success) {
    return {
      success: false,
      error: 'VALIDATION_ERROR',
      message: validation.error.errors[0]?.message ?? 'Invalid slug',
    }
  }

  const availability = await checkOrgSlugAvailable(db, newSlug, organizationId)
  if (!availability.available && availability.takenBy !== 'self') {
    return {
      success: false,
      error: 'SLUG_TAKEN',
      message:
        availability.takenBy === 'reserved'
          ? 'This slug is reserved'
          : 'This slug is already taken by another organization',
    }
  }

  try {
    await db.transaction(async (tx) => {
      await tx
        .update(organizationSlug)
        .set({ isPrimary: false })
        .where(eq(organizationSlug.organizationId, organizationId))

      await tx
        .insert(organizationSlug)
        .values({
          organizationId,
          slug: newSlug,
          isPrimary: true,
        })
        .onConflictDoUpdate({
          target: organizationSlug.slug,
          set: { isPrimary: true },
        })
    })

    return { success: true }
  } catch (err) {
    if (isUniqueViolation(err)) {
      return {
        success: false,
        error: 'SLUG_TAKEN',
        message: 'This slug is already taken by another organization',
      }
    }
    throw err
  }
}
