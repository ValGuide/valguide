import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireStopAccessByNanoId } from '../../../auth/authorization'
import { requireAuthMiddleware } from '../../../auth/middleware'
import { unpublishStopLocale } from './unpublish-stop-locale.server'

export type { UnpublishStopLocaleResult } from './unpublish-stop-locale.server'

const unpublishStopLocaleSchema = z.object({
  nanoId: z.string(),
  locale: z.string(),
})

export const unpublishStopLocaleFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(unpublishStopLocaleSchema)
  .handler(async ({ context, data }) => {
    await requireStopAccessByNanoId(data.nanoId, context.user.id)

    return unpublishStopLocale(data.nanoId, data.locale)
  })
