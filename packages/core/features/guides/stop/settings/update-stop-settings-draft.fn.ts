import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
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

    return updateStopSettingsDraft(
      data.nanoId,
      {
        coordinates: data.coordinates,
        settingsJson: data.settingsJson,
      },
      context.user.id,
    )
  })
