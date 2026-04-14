import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { captureStudioProductEvent } from '../../../posthog/server'
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
    const result = await updateTourQrBrandingSettings(data.tourNanoId, context.user.id, data.override)
    await captureStudioProductEvent({
      distinctId: context.user.id,
      event: 'qr.tour_branding_updated',
      properties: {
        tour_nano_id: data.tourNanoId,
        qr_action: Object.keys(data.override).length === 0 ? 'reset' : 'update',
        style_preset: data.override.stylePreset ?? null,
      },
    })
    return result
  })
