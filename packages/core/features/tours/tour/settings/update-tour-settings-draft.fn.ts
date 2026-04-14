import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { captureStudioProductEvent } from '../../../../posthog/server'
import { requireTourAccessByNanoId } from '../../../auth/authorization'
import { requireAuthMiddleware } from '../../../auth/middleware'
import { updateTourSettingsDraft } from './update-tour-settings-draft.server'

export type {
  UpdateTourSettingsDraftInput,
  UpdateTourSettingsDraftResult,
} from './update-tour-settings-draft.server'

const updateTourSettingsDraftSchema = z.object({
  nanoId: z.string(),
  themeId: z.string().nullable().optional(),
  settingsJson: z.string().nullable().optional(),
})

export const updateTourSettingsDraftFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(updateTourSettingsDraftSchema)
  .handler(async ({ context, data }) => {
    await requireTourAccessByNanoId(data.nanoId, context.user.id)

    const result = await updateTourSettingsDraft(
      data.nanoId,
      {
        themeId: data.themeId,
        settingsJson: data.settingsJson,
      },
      context.user.id,
    )

    await captureStudioProductEvent({
      distinctId: context.user.id,
      event: 'tour.settings_updated',
      properties: {
        tour_nano_id: data.nanoId,
        has_theme_id: data.themeId !== undefined,
        has_settings_json: data.settingsJson !== undefined,
      },
    })

    return result
  })
