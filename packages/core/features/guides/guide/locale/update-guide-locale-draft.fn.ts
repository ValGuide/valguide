import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireGuideAccessByNanoId } from '../../../auth/authorization'
import { requireAuthMiddleware } from '../../../auth/middleware'
import { updateGuideLocaleDraft } from './update-guide-locale-draft.server'

export type { UpdateGuideLocaleDraftInput } from './update-guide-locale-draft.server'

const updateGuideLocaleDraftSchema = z.object({
  nanoId: z.string(),
  locale: z.string(),
  title: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
})

export const updateGuideLocaleDraftFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(updateGuideLocaleDraftSchema)
  .handler(async ({ context, data }) => {
    await requireGuideAccessByNanoId(data.nanoId, context.user.id)

    const { nanoId, locale, ...input } = data
    return updateGuideLocaleDraft(nanoId, locale, input, context.user.id)
  })
