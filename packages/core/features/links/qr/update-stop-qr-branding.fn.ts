import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { captureStudioProductEvent } from '../../../posthog/server'
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
    const result = await updateStopQrBrandingSettings(data.tourNanoId, data.stopNanoId, context.user.id, data.override)
    await captureStudioProductEvent({
      distinctId: context.user.id,
      event: 'qr.stop_branding_updated',
      properties: {
        tour_nano_id: data.tourNanoId,
        stop_nano_id: data.stopNanoId,
        qr_action: Object.keys(data.override).length === 0 ? 'reset' : 'update',
        style_preset: data.override.stylePreset ?? null,
      },
    })
    return result
  })
