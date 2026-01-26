import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireStopAccessByNanoId } from '../../../auth/authorization'
import { requireAuthMiddleware } from '../../../auth/middleware'
import { updateStopLocaleDraft } from './update-stop-locale-draft.server'

export type { UpdateStopLocaleDraftInput, UpdateStopLocaleDraftResult } from './update-stop-locale-draft.server'

const updateStopLocaleDraftSchema = z.object({
  nanoId: z.string(),
  locale: z.string(),
  title: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  transcription: z.string().nullable().optional(),
})

export const updateStopLocaleDraftFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(updateStopLocaleDraftSchema)
  .handler(async ({ context, data }) => {
    await requireStopAccessByNanoId(data.nanoId, context.user.id)

    const { nanoId, locale, ...input } = data
    return updateStopLocaleDraft(nanoId, locale, input, context.user.id)
  })
