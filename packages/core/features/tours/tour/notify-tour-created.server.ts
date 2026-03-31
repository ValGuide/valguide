import { tourCreatedMessage } from '@valguide/slack/messages/tour-created.message'
import { sendSlackMessage } from '@valguide/slack/send-slack-message'
import { and, eq } from 'drizzle-orm'
import { db } from '../../db'
import { organization } from '../../orgs/schema'
import { tour, tourLocaleDraft } from '../schema'

type NotifyTourCreatedInput = {
  actorEmail: string | null
  locale: string
  organizationId: string
  tourNanoId: string
}

export async function notifyTourCreated({
  actorEmail,
  locale,
  organizationId,
  tourNanoId,
}: NotifyTourCreatedInput): Promise<void> {
  const [tourRecord, tourCount] = await Promise.all([
    db
      .select({
        organizationName: organization.name,
        title: tourLocaleDraft.title,
      })
      .from(tour)
      .innerJoin(organization, eq(tour.organizationId, organization.id))
      .leftJoin(tourLocaleDraft, and(eq(tour.id, tourLocaleDraft.tourId), eq(tourLocaleDraft.locale, locale)))
      .where(eq(tour.nanoId, tourNanoId))
      .limit(1),
    db.$count(tour, eq(tour.organizationId, organizationId)),
  ])

  const foundTour = tourRecord[0]
  if (!foundTour) {
    console.error('Tour not found for creation notification:', tourNanoId)
    return
  }

  try {
    await sendSlackMessage(
      tourCreatedMessage({
        actorEmail,
        isFirstCreatedTour: tourCount === 1,
        locale,
        orgName: foundTour.organizationName,
        tourCount,
        tourNanoId,
        tourTitle: foundTour.title ?? null,
        timestampMs: Date.now(),
      }),
    )
  } catch (error) {
    console.error('Failed to send tour created notification to Slack:', error)
  }
}
