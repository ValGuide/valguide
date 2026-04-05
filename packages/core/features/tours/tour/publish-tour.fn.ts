import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { captureStudioProductEvent } from '../../../posthog/server'
import { requireTourAccessByNanoId } from '../../auth/authorization'
import { requireAuthMiddleware } from '../../auth/middleware'
import { getPublishedTourByNanoId } from '../public/get-published-tour'
import { writeOrgSlugToKv, writeTourSlugToKv, writeTourToKv } from '../public/kv'
import { serializeTourForKv } from '../public/kv-serializers'
import { notifyTourPublished } from './notify-tour-published.server'
import { publishTour } from './publish-tour.server'

export type { PublishTourInput, PublishTourResult } from './publish-tour.server'

const publishTourInputSchema = z.object({
  nanoId: z.string(),
  locale: z.string(),
})

export const publishTourFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(publishTourInputSchema)
  .handler(async ({ context, data }) => {
    await requireTourAccessByNanoId(data.nanoId, context.user.id)
    const result = await publishTour(data, context.user.id)

    if (result.success) {
      await captureStudioProductEvent({
        distinctId: context.user.id,
        event: 'tour.published',
        organizationNanoId: result.orgNanoId,
        properties: {
          tour_nano_id: data.nanoId,
          locale: data.locale,
          published_stop_count: result.publishedStopCount,
          has_slug: !!result.tourSlug,
        },
      })

      await notifyTourPublished({
        actorEmail: context.user.email ?? null,
        locale: data.locale,
        publishedStopCount: result.publishedStopCount,
        tourNanoId: data.nanoId,
      })

      // DB read must happen inline (before handler returns) because
      // runWithRequestDb closes the connection in `finally`.
      // Keep the KV refresh in-band as well so an immediate public page load
      // cannot race against stale tour data that was cached before publish.
      const fullTour = await getPublishedTourByNanoId(data.nanoId)
      const tourKv = fullTour ? serializeTourForKv(fullTour, data.locale) : null

      await writeKvAfterPublish(data.nanoId, data.locale, tourKv, result.tourSlug, result.orgSlug, result.orgNanoId)
    }

    return result
  })

async function writeKvAfterPublish(
  tourNanoId: string,
  locale: string,
  tourKv: Parameters<typeof writeTourToKv>[2] | null,
  tourSlug: string | null,
  orgSlug: string | null,
  orgNanoId: string | null,
): Promise<void> {
  try {
    if (tourKv) {
      await writeTourToKv(tourNanoId, locale, tourKv)
    }

    if (orgSlug && orgNanoId) {
      await writeOrgSlugToKv(orgSlug, { nanoId: orgNanoId, primarySlug: orgSlug })
    }

    if (orgSlug && tourSlug) {
      await writeTourSlugToKv(orgSlug, tourSlug, {
        tourNanoId,
        primarySlug: tourSlug,
        orgPrimarySlug: orgSlug,
      })
    }
  } catch (err) {
    console.error('KV write after publish failed (non-fatal):', err)
  }
}
