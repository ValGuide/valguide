import { eq } from 'drizzle-orm'
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
