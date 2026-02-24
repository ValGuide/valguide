import { and, eq } from 'drizzle-orm'
import { NotFoundError } from '../../../auth/authorization'
import { db } from '../../../db'
import { stop, stopLocale, tour, tourStop } from '../../schema'

export type UnpublishStopLocaleResult = {
  success: boolean
  tourNanoIds: string[]
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

  const tours = await db
    .select({ nanoId: tour.nanoId })
    .from(tourStop)
    .innerJoin(tour, eq(tourStop.tourId, tour.id))
    .where(eq(tourStop.stopId, foundStop.id))

  return {
    success: true,
    tourNanoIds: tours.map((t) => t.nanoId),
  }
}
