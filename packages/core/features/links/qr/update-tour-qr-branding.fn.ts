import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireTourAccessByNanoId } from '../../auth/authorization'
import { requireAuthMiddleware } from '../../auth/middleware'
import { updateTourQrBrandingSettings } from './qr-branding.server'
import { qrBrandingOverrideSchema } from './shared'

export type { TourQrCodePayload } from './qr-branding.server'

export const updateTourQrBrandingFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(
    z.object({
      tourNanoId: z.string(),
      override: qrBrandingOverrideSchema,
    }),
  )
  .handler(async ({ context, data }) => {
    await requireTourAccessByNanoId(data.tourNanoId, context.user.id)
    return updateTourQrBrandingSettings(data.tourNanoId, context.user.id, data.override)
  })
