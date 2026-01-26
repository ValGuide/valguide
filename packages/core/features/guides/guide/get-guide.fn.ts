import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { NotFoundError, requireGuideAccessByNanoId } from '../../auth/authorization'
import { requireAuthMiddleware } from '../../auth/middleware'
import { db } from '../../db'
import { guide } from '../schema'

// =============================================================================
// TYPES
// =============================================================================

export type GuideBasic = {
  id: string
  nanoId: string
  organizationId: string
  availableLocales: string[]
  archivedAt: Date | null
  deletedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

// =============================================================================
// INTERNAL FUNCTIONS
// =============================================================================

export async function getGuideById(guideId: string): Promise<GuideBasic | null> {
  const [found] = await db
    .select({
      id: guide.id,
      nanoId: guide.nanoId,
      organizationId: guide.organizationId,
      availableLocales: guide.availableLocales,
      archivedAt: guide.archivedAt,
      deletedAt: guide.deletedAt,
      createdAt: guide.createdAt,
      updatedAt: guide.updatedAt,
    })
    .from(guide)
    .where(eq(guide.id, guideId))
    .limit(1)

  return found ?? null
}

export async function getGuideByNanoId(nanoId: string): Promise<GuideBasic | null> {
  const [found] = await db
    .select({
      id: guide.id,
      nanoId: guide.nanoId,
      organizationId: guide.organizationId,
      availableLocales: guide.availableLocales,
      archivedAt: guide.archivedAt,
      deletedAt: guide.deletedAt,
      createdAt: guide.createdAt,
      updatedAt: guide.updatedAt,
    })
    .from(guide)
    .where(eq(guide.nanoId, nanoId))
    .limit(1)

  return found ?? null
}

// =============================================================================
// SERVER FUNCTION
// =============================================================================

const getGuideSchema = z.object({
  nanoId: z.string(),
})

export const getGuideFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getGuideSchema)
  .handler(async ({ context, data }) => {
    await requireGuideAccessByNanoId(data.nanoId, context.user.id)

    const found = await getGuideByNanoId(data.nanoId)
    if (!found) {
      throw new NotFoundError('Guide')
    }

    return found
  })
