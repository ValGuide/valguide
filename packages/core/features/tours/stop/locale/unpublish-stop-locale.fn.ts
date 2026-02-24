import { createServerFn } from '@tanstack/react-start'
import { waitUntil } from '@valguide/core/utils/wait-until'
import { z } from 'zod'
import { requireStopAccessByNanoId } from '../../../auth/authorization'
import { requireAuthMiddleware } from '../../../auth/middleware'
import { deleteTourFromKv } from '../../public/kv'
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

    const result = await unpublishStopLocale(data.nanoId, data.locale)

    if (result.tourNanoIds.length > 0) {
      waitUntil(
        Promise.all(result.tourNanoIds.map((tourNanoId) => deleteTourFromKv(tourNanoId, data.locale))).catch((err) =>
          console.error('KV delete after stop locale unpublish failed (non-fatal):', err),
        ),
      )
    }

    return result
  })
