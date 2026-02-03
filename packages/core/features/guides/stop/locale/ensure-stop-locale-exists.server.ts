import { and, eq } from 'drizzle-orm'
import { db } from '../../../db'
import { stop, stopLocaleDraft } from '../../schema'

// =============================================================================
// TYPES
// =============================================================================

export type EnsureStopLocaleResult = {
  locale: string
  created: boolean
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

/**
 * Ensure a stopLocaleDraft record exists for the given stop and locale.
 * If the locale already exists, this is a no-op.
 * Returns whether a new locale was created.
 */
export async function ensureStopLocaleExists(nanoId: string, locale: string): Promise<EnsureStopLocaleResult> {
  const [foundStop] = await db.select({ id: stop.id }).from(stop).where(eq(stop.nanoId, nanoId)).limit(1)

  if (!foundStop) {
    throw new Error('Stop not found')
  }

  const [existing] = await db
    .select({ id: stopLocaleDraft.id })
    .from(stopLocaleDraft)
    .where(and(eq(stopLocaleDraft.stopId, foundStop.id), eq(stopLocaleDraft.locale, locale)))
    .limit(1)

  if (existing) {
    return { locale, created: false }
  }

  await db.insert(stopLocaleDraft).values({ stopId: foundStop.id, locale })

  return { locale, created: true }
}
