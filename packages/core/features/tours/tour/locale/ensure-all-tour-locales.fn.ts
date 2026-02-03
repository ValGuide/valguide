import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireTourAccessByNanoId } from '../../../auth/authorization'
import { requireAuthMiddleware } from '../../../auth/middleware'
import { ensureAllTourLocales } from './ensure-all-tour-locales.server'

export type { EnsureAllTourLocalesResult } from './ensure-all-tour-locales.server'

const ensureAllTourLocalesSchema = z.object({
  tourNanoId: z.string(),
})

export const ensureAllTourLocalesFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(ensureAllTourLocalesSchema)
  .handler(async ({ context, data }) => {
    await requireTourAccessByNanoId(data.tourNanoId, context.user.id)
    return ensureAllTourLocales(data.tourNanoId)
  })
