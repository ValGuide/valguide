import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireStopAccessByNanoId, requireTourAccessByNanoId } from '../../auth/authorization'
import { requireAuthMiddleware } from '../../auth/middleware'
import { getOrCreateStopQrCode } from './qr-branding.server'

export type { StopQrCodePayload } from './qr-branding.server'

export const getOrCreateStopQrCodeFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(
    z.object({
      tourNanoId: z.string(),
      stopNanoId: z.string(),
    }),
  )
  .handler(async ({ context, data }) => {
    await requireTourAccessByNanoId(data.tourNanoId, context.user.id)
    await requireStopAccessByNanoId(data.stopNanoId, context.user.id)
    return getOrCreateStopQrCode(data.tourNanoId, data.stopNanoId)
  })
