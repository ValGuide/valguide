import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireStopAccessByNanoId } from '../../../auth/authorization'
import { requireAuthMiddleware } from '../../../auth/middleware'
import { publishStopLocale } from './publish-stop-locale.server'

export type { PublishStopLocaleResult } from './publish-stop-locale.server'

const publishStopLocaleSchema = z.object({
  nanoId: z.string(),
  locale: z.string(),
})

export const publishStopLocaleFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(publishStopLocaleSchema)
  .handler(async ({ context, data }) => {
    await requireStopAccessByNanoId(data.nanoId, context.user.id)

    return publishStopLocale(data.nanoId, data.locale, context.user.id)
  })
