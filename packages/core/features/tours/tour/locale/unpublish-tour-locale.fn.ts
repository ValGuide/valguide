import { createServerFn } from '@tanstack/react-start'
import { waitUntil } from '@valguide/core/utils/wait-until'
import { z } from 'zod'
import { requireTourAccessByNanoId } from '../../../auth/authorization'
import { requireAuthMiddleware } from '../../../auth/middleware'
import { deleteTourFromKv } from '../../public/kv'
import { unpublishTourLocale } from './unpublish-tour-locale.server'

export type { UnpublishTourLocaleResult } from './unpublish-tour-locale.server'

const unpublishTourLocaleSchema = z.object({
  nanoId: z.string(),
  locale: z.string(),
})

export const unpublishTourLocaleFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(unpublishTourLocaleSchema)
  .handler(async ({ context, data }) => {
    await requireTourAccessByNanoId(data.nanoId, context.user.id)

    const result = await unpublishTourLocale(data.nanoId, data.locale)

    waitUntil(deleteTourFromKv(data.nanoId, data.locale))

    return result
  })
