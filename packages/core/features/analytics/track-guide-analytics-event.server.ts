import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '../db'
import { stop, tour, tourStop } from '../tours/schema'
import { guideAnalyticsEvent } from './schema'

const baseGuideAnalyticsEventInputSchema = z.object({
  visitorId: z.string().min(8).max(64),
  tourNanoId: z.string().min(1).max(21),
  locale: z.string().min(2).max(10).optional().nullable(),
  path: z.string().max(2048).optional().nullable(),
})

export const guideAnalyticsEventInputSchema = z.discriminatedUnion('eventType', [
  baseGuideAnalyticsEventInputSchema.extend({
    eventType: z.literal('tour_opened'),
  }),
  baseGuideAnalyticsEventInputSchema.extend({
    eventType: z.literal('stop_opened'),
    stopNanoId: z.string().min(1).max(21),
  }),
  baseGuideAnalyticsEventInputSchema.extend({
    eventType: z.literal('audio_played'),
    stopNanoId: z.string().min(1).max(21),
  }),
])

export type GuideAnalyticsEventInput = z.infer<typeof guideAnalyticsEventInputSchema>

export async function trackGuideAnalyticsEvent(input: GuideAnalyticsEventInput): Promise<void> {
  const [foundTour] = await db
    .select({
      id: tour.id,
      organizationId: tour.organizationId,
    })
    .from(tour)
    .where(eq(tour.nanoId, input.tourNanoId))
    .limit(1)

  if (!foundTour) {
    return
  }

  let stopId: string | null = null

  if ('stopNanoId' in input) {
    const [foundStop] = await db
      .select({
        id: stop.id,
      })
      .from(stop)
      .innerJoin(tourStop, eq(tourStop.stopId, stop.id))
      .where(and(eq(stop.nanoId, input.stopNanoId), eq(tourStop.tourId, foundTour.id)))
      .limit(1)

    if (!foundStop) {
      return
    }

    stopId = foundStop.id
  }

  await db.insert(guideAnalyticsEvent).values({
    organizationId: foundTour.organizationId,
    tourId: foundTour.id,
    stopId,
    visitorId: input.visitorId,
    eventType: input.eventType,
    locale: input.locale ?? null,
    path: input.path ?? null,
  })
}
