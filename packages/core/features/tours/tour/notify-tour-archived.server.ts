import { tourArchivedMessage } from '@valguide/slack/messages/tour-archived.message'
import { sendSlackMessage } from '@valguide/slack/send-slack-message'
import { and, eq } from 'drizzle-orm'
import { db } from '../../db'
import { organization } from '../../orgs/schema'
import { tour, tourLocale, tourLocaleDraft } from '../schema'

type NotifyTourArchivedInput = {
  actorEmail: string | null
  archivedAt: Date
  publishedLocaleCount: number
  tourNanoId: string
  wasPublished: boolean
}

export async function notifyTourArchived({
  actorEmail,
  archivedAt,
  publishedLocaleCount,
  tourNanoId,
  wasPublished,
}: NotifyTourArchivedInput): Promise<void> {
  const [tourRecord] = await db
    .select({
      availableLocales: tour.availableLocales,
      tourId: tour.id,
      organizationName: organization.name,
    })
    .from(tour)
    .innerJoin(organization, eq(tour.organizationId, organization.id))
    .where(eq(tour.nanoId, tourNanoId))
    .limit(1)

  if (!tourRecord) {
    console.error(`[Slack][tour_archived] Tour not found for notification: ${tourNanoId}`)
    return
  }

  const preferredLocale = tourRecord.availableLocales[0]
  const [draftTitleRecord, liveTitleRecord] = preferredLocale
    ? await Promise.all([
        db
          .select({ title: tourLocaleDraft.title })
          .from(tourLocaleDraft)
          .where(and(eq(tourLocaleDraft.tourId, tourRecord.tourId), eq(tourLocaleDraft.locale, preferredLocale)))
          .limit(1),
        db
          .select({ title: tourLocale.title })
          .from(tourLocale)
          .where(and(eq(tourLocale.tourId, tourRecord.tourId), eq(tourLocale.locale, preferredLocale)))
          .limit(1),
      ])
    : [[], []]

  try {
    await sendSlackMessage(
      tourArchivedMessage({
        actorEmail,
        archivedAtMs: archivedAt.getTime(),
        orgName: tourRecord.organizationName,
        publishedLocaleCount,
        tourNanoId,
        tourTitle: draftTitleRecord[0]?.title ?? liveTitleRecord[0]?.title ?? null,
        wasPublished,
      }),
    )
  } catch (error) {
    console.error(`[Slack][tour_archived] Failed to send notification for tour ${tourNanoId}:`, error)
  }
}
