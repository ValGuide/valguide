import { eq } from 'drizzle-orm'
import { slugSchema } from '../../utils/slug'
import type { DB } from '../db'
import { isUniqueViolation } from '../links/utils'
import { checkOrgSlugAvailable } from './check-org-slug-available.server'
import { organization, organizationSlug } from './schema'

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
      // Read current slug
      const [current] = await tx
        .select({ slug: organization.slug })
        .from(organization)
        .where(eq(organization.id, organizationId))
        .limit(1)

      // Insert old slug into redirect table (if different)
      if (current && current.slug !== newSlug) {
        await tx.insert(organizationSlug).values({
          organizationId,
          slug: current.slug,
        })
      }

      // Update canonical slug
      await tx.update(organization).set({ slug: newSlug }).where(eq(organization.id, organizationId))
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
