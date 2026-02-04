import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { NotFoundError, requireStopAccessByNanoId } from '../../../auth/authorization'
import { requireAuthMiddleware } from '../../../auth/middleware'
import { compareStopLocaleDiff } from './compare-stop-locale-diff.server'

export type { FieldDiff, StopLocaleDiffResult } from './compare-stop-locale-diff.server'

const compareStopLocaleDiffSchema = z.object({
  nanoId: z.string(),
  locale: z.string(),
})

export const compareStopLocaleDiffFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(compareStopLocaleDiffSchema)
  .handler(async ({ context, data }) => {
    await requireStopAccessByNanoId(data.nanoId, context.user.id)

    const diff = await compareStopLocaleDiff(data.nanoId, data.locale)
    if (!diff) {
      throw new NotFoundError('Stop locale')
    }

    return diff
  })
