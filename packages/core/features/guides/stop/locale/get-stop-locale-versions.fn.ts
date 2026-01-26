import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { NotFoundError, requireStopAccessByNanoId } from '../../../auth/authorization'
import { requireAuthMiddleware } from '../../../auth/middleware'
import { getStopVersions } from './get-stop-locale-versions.server'

export type { GetStopVersionsResult, StopLocaleVersionInfo } from './get-stop-locale-versions.server'

const getStopVersionsSchema = z.object({
  nanoId: z.string(),
  locale: z.string(),
})

export const getStopVersionsFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getStopVersionsSchema)
  .handler(async ({ context, data }) => {
    await requireStopAccessByNanoId(data.nanoId, context.user.id)

    const result = await getStopVersions(data.nanoId, data.locale)
    if (!result) {
      throw new NotFoundError('Stop locale')
    }

    return result
  })
