import { createServerFn } from '@tanstack/react-start'
import { waitUntil } from '@valguide/core/utils/wait-until'
import { z } from 'zod'
import { requireAuthMiddleware } from '../../auth/middleware'
import { deleteTourAllLocalesFromKv, deleteTourSharedFromKv, deleteTourSlugFromKv } from '../public/kv'
import { deleteTour, permanentlyDeleteTour } from './delete-tour.server'

export type { DeleteTourResult } from './delete-tour.server'

const deleteTourSchema = z.object({
  nanoId: z.string(),
  permanent: z.boolean().optional(),
})

export const deleteTourFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(deleteTourSchema)
  .handler(async ({ context, data }) => {
    const result = data.permanent
      ? await permanentlyDeleteTour(data.nanoId, context.user.id)
      : await deleteTour(data.nanoId, context.user.id)

    if (result.publishedLocales.length > 0 || result.tourSlug) {
      waitUntil(deleteKvAfterTourRemoval(data.nanoId, result.publishedLocales, result.tourSlug, result.orgSlug))
    }

    return result
  })

async function deleteKvAfterTourRemoval(
  tourNanoId: string,
  publishedLocales: string[],
  tourSlug: string | null,
  orgSlug: string | null,
): Promise<void> {
  try {
    await deleteTourAllLocalesFromKv(tourNanoId, publishedLocales)
    await deleteTourSharedFromKv(tourNanoId)
    if (orgSlug && tourSlug) {
      await deleteTourSlugFromKv(orgSlug, tourSlug)
    }
  } catch (err) {
    console.error('KV delete after tour removal failed (non-fatal):', err)
  }
}
