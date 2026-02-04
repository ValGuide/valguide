import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { NotFoundError, requireTourAccessByNanoId } from '../../../auth/authorization'
import { requireAuthMiddleware } from '../../../auth/middleware'
import { compareTourLocaleDiff } from './compare-tour-locale-diff.server'

export type { FieldDiff, TourLocaleDiffResult } from './compare-tour-locale-diff.server'

const compareTourLocaleDiffSchema = z.object({
  nanoId: z.string(),
  locale: z.string(),
})

export const compareTourLocaleDiffFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(compareTourLocaleDiffSchema)
  .handler(async ({ context, data }) => {
    await requireTourAccessByNanoId(data.nanoId, context.user.id)

    const diff = await compareTourLocaleDiff(data.nanoId, data.locale)
    if (!diff) {
      throw new NotFoundError('Tour locale')
    }

    return diff
  })
