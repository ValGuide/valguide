import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireStopAccessByNanoId } from '../../../auth/authorization'
import { requireAuthMiddleware } from '../../../auth/middleware'
import { getStopLocalePublished } from './get-stop-locale-published.server'

export type { StopLocalePublishedResult } from './get-stop-locale-published.server'

const getStopLocalePublishedSchema = z.object({
  nanoId: z.string(),
  locale: z.string(),
})

export const getStopLocalePublishedFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getStopLocalePublishedSchema)
  .handler(async ({ context, data }) => {
    await requireStopAccessByNanoId(data.nanoId, context.user.id)
    return getStopLocalePublished(data.nanoId, data.locale)
  })
