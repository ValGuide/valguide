import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireStopAccessByNanoId } from '../../../auth/authorization'
import { requireAuthMiddleware } from '../../../auth/middleware'
import { getStopLocales } from './get-stop-locales.server'

export type { StopExistingLocales } from './get-stop-locales.server'

const getStopLocalesSchema = z.object({
  nanoId: z.string(),
})

export const getStopLocalesFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getStopLocalesSchema)
  .handler(async ({ context, data }) => {
    await requireStopAccessByNanoId(data.nanoId, context.user.id)
    return getStopLocales(data.nanoId)
  })
