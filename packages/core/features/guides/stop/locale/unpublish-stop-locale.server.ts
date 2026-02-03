import { and, eq } from 'drizzle-orm'
import { NotFoundError } from '../../../auth/authorization'
import { db } from '../../../db'
import { stop, stopLocale } from '../../schema'

export type UnpublishStopLocaleResult = {
  success: boolean
}

export async function unpublishStopLocale(stopNanoId: string, locale: string): Promise<UnpublishStopLocaleResult> {
  const [foundStop] = await db.select({ id: stop.id }).from(stop).where(eq(stop.nanoId, stopNanoId)).limit(1)

  if (!foundStop) {
    throw new NotFoundError('Stop')
  }

  const result = await db
    .delete(stopLocale)
    .where(and(eq(stopLocale.stopId, foundStop.id), eq(stopLocale.locale, locale)))
    .returning({ id: stopLocale.id })

  if (result.length === 0) {
    throw new NotFoundError('Stop locale')
  }

  return { success: true }
}
