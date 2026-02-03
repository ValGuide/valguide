import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { NotFoundError, requireStopAccessByNanoId } from '../../auth/authorization'
import { requireAuthMiddleware } from '../../auth/middleware'
import { getStop } from './get-stop.server'

export type { StopBasic } from './get-stop.server'

const getStopSchema = z.object({
  nanoId: z.string(),
})

export const getStopFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getStopSchema)
  .handler(async ({ context, data }) => {
    await requireStopAccessByNanoId(data.nanoId, context.user.id)

    const foundStop = await getStop(data.nanoId)
    if (!foundStop) {
      throw new NotFoundError('Stop')
    }

    return foundStop
  })
