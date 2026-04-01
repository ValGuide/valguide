import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireTourAccessByNanoId } from '../../auth/authorization'
import { requireAuthMiddleware } from '../../auth/middleware'
import { getOrCreateTourQrCode } from './qr-branding.server'

export type { TourQrCodePayload } from './qr-branding.server'

export const getOrCreateTourQrCodeFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(
    z.object({
      tourNanoId: z.string(),
    }),
  )
  .handler(async ({ context, data }) => {
    await requireTourAccessByNanoId(data.tourNanoId, context.user.id)
    return getOrCreateTourQrCode(data.tourNanoId)
  })
