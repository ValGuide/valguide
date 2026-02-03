import { eq } from 'drizzle-orm'
import { db } from '../../db'
import { tour, tourStopDraft, stop } from '../schema'

export type StopTourUsageResult = {
  tourCount: number
  tours: Array<{
    nanoId: string
    title: string | null
  }>
}

export async function getStopTourUsage(stopNanoId: string): Promise<StopTourUsageResult> {
  const [stopRow] = await db.select({ id: stop.id }).from(stop).where(eq(stop.nanoId, stopNanoId)).limit(1)

  if (!stopRow) {
    return { tourCount: 0, tours: [] }
  }

  const usages = await db
    .select({
      tourNanoId: tour.nanoId,
      tourId: tour.id,
    })
    .from(tourStopDraft)
    .innerJoin(tour, eq(tourStopDraft.tourId, tour.id))
    .where(eq(tourStopDraft.stopId, stopRow.id))

  return {
    tourCount: usages.length,
    tours: usages.map((u) => ({
      nanoId: u.tourNanoId,
      title: null, // Title requires locale lookup - keep simple for now
    })),
  }
}
