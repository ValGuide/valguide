import { format, subDays } from 'date-fns'
import { and, desc, eq, inArray, isNull } from 'drizzle-orm'
import { db } from '../db'
import { tour, tourLocale } from '../tours/schema'
import { guideAnalyticsEvent } from './schema'

export type GuideAnalyticsSummary = {
  totals: {
    uniqueVisitors: number
    tourOpens: number
    stopOpens: number
    audioPlays: number
  }
  recentActivity: {
    date: string
    label: string
    tourOpens: number
    stopOpens: number
    audioPlays: number
  }[]
  eventMix: {
    eventType: 'tour_opened' | 'stop_opened' | 'audio_played'
    count: number
  }[]
  tours: {
    nanoId: string
    title: string
    uniqueVisitors: number
    tourOpens: number
    stopOpens: number
    audioPlays: number
    lastActivityAt: string | null
  }[]
}

type TourLocaleRow = {
  tourId: string
  locale: string
  title: string | null
}

export async function getGuideAnalytics(organizationId: string): Promise<GuideAnalyticsSummary> {
  const tours = await db
    .select({
      id: tour.id,
      nanoId: tour.nanoId,
    })
    .from(tour)
    .where(and(eq(tour.organizationId, organizationId), isNull(tour.deletedAt), isNull(tour.archivedAt)))

  const tourIds = tours.map((entry) => entry.id)
  const localeRows =
    tourIds.length > 0
      ? await db
          .select({
            tourId: tourLocale.tourId,
            locale: tourLocale.locale,
            title: tourLocale.title,
          })
          .from(tourLocale)
          .where(inArray(tourLocale.tourId, tourIds))
      : []

  const events = await db
    .select({
      tourId: guideAnalyticsEvent.tourId,
      visitorId: guideAnalyticsEvent.visitorId,
      eventType: guideAnalyticsEvent.eventType,
      createdAt: guideAnalyticsEvent.createdAt,
    })
    .from(guideAnalyticsEvent)
    .where(eq(guideAnalyticsEvent.organizationId, organizationId))
    .orderBy(desc(guideAnalyticsEvent.createdAt))

  const totalVisitors = new Set<string>()
  let tourOpens = 0
  let stopOpens = 0
  let audioPlays = 0

  for (const event of events) {
    totalVisitors.add(event.visitorId)

    if (event.eventType === 'tour_opened') {
      tourOpens += 1
    }

    if (event.eventType === 'stop_opened') {
      stopOpens += 1
    }

    if (event.eventType === 'audio_played') {
      audioPlays += 1
    }
  }

  const recentActivityStart = subDays(new Date(), 13)
  const recentActivityMap = new Map<string, GuideAnalyticsSummary['recentActivity'][number]>()

  for (let offset = 13; offset >= 0; offset -= 1) {
    const currentDate = subDays(new Date(), offset)
    const key = format(currentDate, 'yyyy-MM-dd')
    recentActivityMap.set(key, {
      date: key,
      label: format(currentDate, 'MMM d'),
      tourOpens: 0,
      stopOpens: 0,
      audioPlays: 0,
    })
  }

  for (const event of events) {
    if (event.createdAt < recentActivityStart) {
      continue
    }

    const key = format(event.createdAt, 'yyyy-MM-dd')
    const currentBucket = recentActivityMap.get(key)

    if (!currentBucket) {
      continue
    }

    if (event.eventType === 'tour_opened') {
      currentBucket.tourOpens += 1
    }

    if (event.eventType === 'stop_opened') {
      currentBucket.stopOpens += 1
    }

    if (event.eventType === 'audio_played') {
      currentBucket.audioPlays += 1
    }
  }

  const titleByTourId = new Map<string, string>()
  const localesByTourId = new Map<string, TourLocaleRow[]>()

  for (const localeRow of localeRows) {
    const currentRows = localesByTourId.get(localeRow.tourId) ?? []
    currentRows.push(localeRow)
    localesByTourId.set(localeRow.tourId, currentRows)
  }

  for (const tourEntry of tours) {
    const localizedRows = localesByTourId.get(tourEntry.id) ?? []
    const preferredTitle =
      localizedRows.find((row) => row.locale === 'en' && row.title)?.title ??
      localizedRows.find((row) => row.title)?.title ??
      tourEntry.nanoId

    titleByTourId.set(tourEntry.id, preferredTitle)
  }

  const tourSummaryMap = new Map<
    string,
    {
      nanoId: string
      title: string
      uniqueVisitors: Set<string>
      tourOpens: number
      stopOpens: number
      audioPlays: number
      lastActivityAt: string | null
    }
  >()

  for (const tourEntry of tours) {
    tourSummaryMap.set(tourEntry.id, {
      nanoId: tourEntry.nanoId,
      title: titleByTourId.get(tourEntry.id) ?? tourEntry.nanoId,
      uniqueVisitors: new Set<string>(),
      tourOpens: 0,
      stopOpens: 0,
      audioPlays: 0,
      lastActivityAt: null,
    })
  }

  for (const event of events) {
    const summary = tourSummaryMap.get(event.tourId)

    if (!summary) {
      continue
    }

    summary.uniqueVisitors.add(event.visitorId)
    summary.lastActivityAt = summary.lastActivityAt ?? event.createdAt.toISOString()

    if (event.eventType === 'tour_opened') {
      summary.tourOpens += 1
    }

    if (event.eventType === 'stop_opened') {
      summary.stopOpens += 1
    }

    if (event.eventType === 'audio_played') {
      summary.audioPlays += 1
    }
  }

  return {
    totals: {
      uniqueVisitors: totalVisitors.size,
      tourOpens,
      stopOpens,
      audioPlays,
    },
    recentActivity: Array.from(recentActivityMap.values()),
    eventMix: [
      { eventType: 'tour_opened', count: tourOpens },
      { eventType: 'stop_opened', count: stopOpens },
      { eventType: 'audio_played', count: audioPlays },
    ],
    tours: Array.from(tourSummaryMap.values())
      .map((summary) => ({
        nanoId: summary.nanoId,
        title: summary.title,
        uniqueVisitors: summary.uniqueVisitors.size,
        tourOpens: summary.tourOpens,
        stopOpens: summary.stopOpens,
        audioPlays: summary.audioPlays,
        lastActivityAt: summary.lastActivityAt,
      }))
      .sort((left, right) => {
        if (right.tourOpens !== left.tourOpens) {
          return right.tourOpens - left.tourOpens
        }

        if (right.audioPlays !== left.audioPlays) {
          return right.audioPlays - left.audioPlays
        }

        return left.title.localeCompare(right.title)
      }),
  }
}
