import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireTourAccessByNanoId } from '../../../auth/authorization'
import { requireAuthMiddleware } from '../../../auth/middleware'
import { getTourLocalePublished } from './get-tour-locale-published.server'

export type { TourLocalePublishedResult } from './get-tour-locale-published.server'

const getTourLocalePublishedSchema = z.object({
  nanoId: z.string(),
  locale: z.string(),
})

export const getTourLocalePublishedFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getTourLocalePublishedSchema)
  .handler(async ({ context, data }) => {
    await requireTourAccessByNanoId(data.nanoId, context.user.id)
    return getTourLocalePublished(data.nanoId, data.locale)
  })
