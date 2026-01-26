import { and, eq, isNull } from 'drizzle-orm'
import { db } from '../../db'
import { stop } from '../schema'

// =============================================================================
// TYPES
// =============================================================================

export type StopBasic = {
  nanoId: string
  organizationId: string
  availableLocales: string[]
  archivedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function getStop(nanoId: string): Promise<StopBasic | null> {
  const [foundStop] = await db
    .select({
      nanoId: stop.nanoId,
      organizationId: stop.organizationId,
      availableLocales: stop.availableLocales,
      archivedAt: stop.archivedAt,
      createdAt: stop.createdAt,
      updatedAt: stop.updatedAt,
    })
    .from(stop)
    .where(and(eq(stop.nanoId, nanoId), isNull(stop.deletedAt)))
    .limit(1)

  return foundStop ?? null
}
