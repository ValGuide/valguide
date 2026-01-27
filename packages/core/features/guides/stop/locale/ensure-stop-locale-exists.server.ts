import { and, eq } from 'drizzle-orm'
import { db } from '../../../db'
import { stop, stopLocale, stopLocaleDraft } from '../../schema'

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
 * Ensure a stopLocale + stopLocaleDraft record exists for the given stop and locale.
 * If the locale already exists, this is a no-op.
 * Returns whether a new locale was created.
 */
export async function ensureStopLocaleExists(nanoId: string, locale: string): Promise<EnsureStopLocaleResult> {
  const [foundStop] = await db.select({ id: stop.id }).from(stop).where(eq(stop.nanoId, nanoId)).limit(1)

  if (!foundStop) {
    throw new Error('Stop not found')
  }

  const [existing] = await db
    .select({ id: stopLocale.id })
    .from(stopLocale)
    .where(and(eq(stopLocale.stopId, foundStop.id), eq(stopLocale.locale, locale)))
    .limit(1)

  if (existing) {
    return { locale, created: false }
  }

  const [newLocale] = await db
    .insert(stopLocale)
    .values({ stopId: foundStop.id, locale })
    .returning({ id: stopLocale.id })

  await db.insert(stopLocaleDraft).values({ stopLocaleId: newLocale.id })

  return { locale, created: true }
}
