import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireStopAccessByNanoId, requireTourAccessByNanoId } from '../../auth/authorization'
import { requireAuthMiddleware } from '../../auth/middleware'
import { updateStopQrBrandingSettings } from './qr-branding.server'
import { qrBrandingOverrideSchema } from './shared'

export type { StopQrCodePayload } from './qr-branding.server'

export const updateStopQrBrandingFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(
    z.object({
      tourNanoId: z.string(),
      stopNanoId: z.string(),
      override: qrBrandingOverrideSchema,
    }),
  )
  .handler(async ({ context, data }) => {
    await requireTourAccessByNanoId(data.tourNanoId, context.user.id)
    await requireStopAccessByNanoId(data.stopNanoId, context.user.id)
    return updateStopQrBrandingSettings(data.tourNanoId, data.stopNanoId, context.user.id, data.override)
  })
