import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireGuideAccessByNanoId } from '../../../auth/authorization'
import { requireAuthMiddleware } from '../../../auth/middleware'
import { updateGuideSettingsDraft } from './update-guide-settings-draft.server'

export type {
  UpdateGuideSettingsDraftInput,
  UpdateGuideSettingsDraftResult,
} from './update-guide-settings-draft.server'

const updateGuideSettingsDraftSchema = z.object({
  nanoId: z.string(),
  themeId: z.string().nullable().optional(),
  settingsJson: z.string().nullable().optional(),
})

export const updateGuideSettingsDraftFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(updateGuideSettingsDraftSchema)
  .handler(async ({ context, data }) => {
    await requireGuideAccessByNanoId(data.nanoId, context.user.id)

    return updateGuideSettingsDraft(
      data.nanoId,
      {
        themeId: data.themeId,
        settingsJson: data.settingsJson,
      },
      context.user.id,
    )
  })
