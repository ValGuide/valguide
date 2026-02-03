import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireGuideAccessByNanoId } from '../../auth/authorization'
import { requireAuthMiddleware } from '../../auth/middleware'
import { publishGuide } from './publish-guide.server'

export type { PublishGuideInput, PublishGuideResult } from './publish-guide.server'

const publishGuideInputSchema = z.object({
  nanoId: z.string(),
  locale: z.string(),
})

export const publishGuideFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(publishGuideInputSchema)
  .handler(async ({ context, data }) => {
    await requireGuideAccessByNanoId(data.nanoId, context.user.id)
    return publishGuide(data, context.user.id)
  })
