import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { slugSchema } from '../../../../utils/slug'
import { requireTourAccessByNanoId } from '../../../auth/authorization'
import { requireAuthMiddleware } from '../../../auth/middleware'
import { db } from '../../../db'
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
    return updateTourSlug(db, tourId, organizationId, data.newSlug)
  })
