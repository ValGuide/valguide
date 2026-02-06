import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireTourAccessByNanoId } from '../../../auth/authorization'
import { requireAuthMiddleware } from '../../../auth/middleware'
import { db } from '../../../db'
import { checkTourSlugAvailable } from './check-tour-slug-available.server'

export type { TourSlugAvailabilityResult } from './check-tour-slug-available.server'

const checkTourSlugAvailableSchema = z.object({
  slug: z.string(),
  tourNanoId: z.string(),
})

export const checkTourSlugAvailableFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(checkTourSlugAvailableSchema)
  .handler(async ({ context, data }) => {
    const { tourId, organizationId } = await requireTourAccessByNanoId(data.tourNanoId, context.user.id)

    return checkTourSlugAvailable(db, data.slug, organizationId, tourId)
  })
