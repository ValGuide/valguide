import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { slugSchema } from '../../../../utils/slug'
import { requireTourAccessByNanoId } from '../../../auth/authorization'
import { requireAuthMiddleware } from '../../../auth/middleware'
import { db } from '../../../db'
import { upsertTourDraftSlug } from './upsert-tour-draft-slug.server'

export type { UpsertTourDraftSlugResult } from './upsert-tour-draft-slug.server'

const upsertTourDraftSlugSchema = z.object({
  tourNanoId: z.string(),
  newSlug: slugSchema,
})

export const upsertTourDraftSlugFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(upsertTourDraftSlugSchema)
  .handler(async ({ context, data }) => {
    const { tourId, organizationId } = await requireTourAccessByNanoId(data.tourNanoId, context.user.id)

    return upsertTourDraftSlug(db, tourId, organizationId, data.newSlug)
  })
