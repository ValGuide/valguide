import { tourPublishedMessage } from '@valguide/slack/messages/tour-published.message'
import { sendSlackMessage } from '@valguide/slack/send-slack-message'
import { and, eq, isNotNull } from 'drizzle-orm'
import { db } from '../../db'
import { organization } from '../../orgs/schema'
import { tour, tourLocale } from '../schema'

type NotifyTourPublishedInput = {
  actorEmail: string | null
  locale: string
  publishedStopCount: number
  tourNanoId: string
}

export async function notifyTourPublished({
  actorEmail,
  locale,
  publishedStopCount,
  tourNanoId,
}: NotifyTourPublishedInput): Promise<void> {
  const [tourRecord] = await db
    .select({
      organizationId: tour.organizationId,
      organizationName: organization.name,
      title: tourLocale.title,
    })
    .from(tour)
    .innerJoin(organization, eq(tour.organizationId, organization.id))
    .leftJoin(tourLocale, and(eq(tour.id, tourLocale.tourId), eq(tourLocale.locale, locale)))
    .where(eq(tour.nanoId, tourNanoId))
    .limit(1)

  if (!tourRecord) {
    console.error('Tour not found for publish notification:', tourNanoId)
    return
  }

  const publishedTourCount = await db.$count(
    tour,
    and(eq(tour.organizationId, tourRecord.organizationId), isNotNull(tour.publishedAt)),
  )

  try {
    await sendSlackMessage(
      tourPublishedMessage({
        actorEmail,
        isFirstPublishedTour: publishedTourCount === 1,
        locale,
        orgName: tourRecord.organizationName,
        publishedStopCount,
        timestampMs: Date.now(),
        tourNanoId,
        tourTitle: tourRecord.title ?? null,
      }),
    )
  } catch (error) {
    console.error('Failed to send tour published notification to Slack:', error)
  }
}
