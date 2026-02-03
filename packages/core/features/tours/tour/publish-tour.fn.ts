import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireTourAccessByNanoId } from '../../auth/authorization'
import { requireAuthMiddleware } from '../../auth/middleware'
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
    return publishTour(data, context.user.id)
  })
