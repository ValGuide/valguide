import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireTourAccessByNanoId } from '../../../auth/authorization'
import { requireAuthMiddleware } from '../../../auth/middleware'
import { db } from '../../../db'
import { getTourSlugs } from './get-tour-slugs.server'

export type { TourSlugRecord } from './get-tour-slugs.server'

const getTourSlugsSchema = z.object({
  tourNanoId: z.string(),
})

export const getTourSlugsFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getTourSlugsSchema)
  .handler(async ({ context, data }) => {
    const { tourId } = await requireTourAccessByNanoId(data.tourNanoId, context.user.id)

    return getTourSlugs(db, tourId)
  })
