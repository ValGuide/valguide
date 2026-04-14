import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { captureStudioProductEvent } from '../../../../posthog/server'
import { slugSchema } from '../../../../utils/slug'
import { waitUntil } from '../../../../utils/wait-until'
import { requireTourAccessByNanoId } from '../../../auth/authorization'
import { requireAuthMiddleware } from '../../../auth/middleware'
import { db } from '../../../db'
import { writeTourSlugToKv } from '../../public/kv'
import { updateTourSlug } from './update-tour-slug.server'

export type { UpdateTourSlugResult } from './update-tour-slug.server'

const updateTourSlugSchema = z.object({
  tourNanoId: z.string(),
  newSlug: slugSchema,
})

export const updateTourSlugFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(updateTourSlugSchema)
  .handler(async ({ context, data }) => {
    const { tourId, organizationId } = await requireTourAccessByNanoId(data.tourNanoId, context.user.id)
    const result = await updateTourSlug(db, tourId, organizationId, data.newSlug)

    if (result.success) {
      captureStudioProductEvent({
        distinctId: context.user.id,
        event: 'tour.slug_updated',
        properties: {
          tour_nano_id: result.tourNanoId,
          new_slug: data.newSlug,
        },
      })

      const kvEntry = {
        tourNanoId: result.tourNanoId,
        primarySlug: data.newSlug,
        orgPrimarySlug: result.orgSlug,
      }
      waitUntil(
        Promise.all([
          writeTourSlugToKv(result.orgSlug, data.newSlug, kvEntry),
          ...(result.oldSlug !== data.newSlug ? [writeTourSlugToKv(result.orgSlug, result.oldSlug, kvEntry)] : []),
        ]),
      )
    }

    return result
  })
