import { createServerFn } from '@tanstack/react-start'
import { waitUntil } from '@valguide/core/utils/wait-until'
import { z } from 'zod'
import { requireAuthMiddleware } from '../../auth/middleware'
import { deleteTourAllLocalesFromKv, deleteTourSlugFromKv } from '../public/kv'
import { archiveTour } from './archive-tour.server'
import { notifyTourArchived } from './notify-tour-archived.server'

export type { ArchiveTourResult } from './archive-tour.server'

const archiveTourSchema = z.object({
  nanoId: z.string(),
})

export const archiveTourFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(archiveTourSchema)
  .handler(async ({ context, data }) => {
    const result = await archiveTour(data.nanoId, context.user.id)

    await notifyTourArchived({
      actorEmail: context.user.email ?? null,
      archivedAt: result.archivedAt,
      publishedLocaleCount: result.publishedLocales.length,
      tourNanoId: result.nanoId,
      wasPublished: result.publishedLocales.length > 0,
    })

    if (result.publishedLocales.length > 0 || result.tourSlug) {
      waitUntil(deleteKvAfterArchive(data.nanoId, result.publishedLocales, result.tourSlug, result.orgSlug))
    }

    return result
  })

async function deleteKvAfterArchive(
  tourNanoId: string,
  publishedLocales: string[],
  tourSlug: string | null,
  orgSlug: string | null,
): Promise<void> {
  try {
    await deleteTourAllLocalesFromKv(tourNanoId, publishedLocales)
    if (orgSlug && tourSlug) {
      await deleteTourSlugFromKv(orgSlug, tourSlug)
    }
  } catch (err) {
    console.error('KV delete after archive failed (non-fatal):', err)
  }
}
