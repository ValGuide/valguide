import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { captureStudioProductEvent } from '../../../../posthog/server'
import { requireStopAccessByNanoId } from '../../../auth/authorization'
import { requireAuthMiddleware } from '../../../auth/middleware'
import { updateStopSettingsDraft } from './update-stop-settings-draft.server'

export type { UpdateStopSettingsDraftInput, UpdateStopSettingsDraftResult } from './update-stop-settings-draft.server'

const updateStopSettingsDraftSchema = z.object({
  nanoId: z.string(),
  coordinates: z.string().nullable().optional(),
  settingsJson: z.string().nullable().optional(),
})

export const updateStopSettingsDraftFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(updateStopSettingsDraftSchema)
  .handler(async ({ context, data }) => {
    await requireStopAccessByNanoId(data.nanoId, context.user.id)

    const result = await updateStopSettingsDraft(
      data.nanoId,
      {
        coordinates: data.coordinates,
        settingsJson: data.settingsJson,
      },
      context.user.id,
    )

    await captureStudioProductEvent({
      distinctId: context.user.id,
      event: 'stop.settings_updated',
      properties: {
        stop_nano_id: data.nanoId,
        has_coordinates: data.coordinates !== undefined,
        has_settings_json: data.settingsJson !== undefined,
      },
    })

    return result
  })
