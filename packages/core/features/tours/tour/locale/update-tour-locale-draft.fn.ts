import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireTourAccessByNanoId } from '../../../auth/authorization'
import { requireAuthMiddleware } from '../../../auth/middleware'
import { updateTourLocaleDraft } from './update-tour-locale-draft.server'

export type { UpdateTourLocaleDraftInput } from './update-tour-locale-draft.server'

const updateTourLocaleDraftSchema = z.object({
  nanoId: z.string(),
  locale: z.string(),
  title: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
})

export const updateTourLocaleDraftFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(updateTourLocaleDraftSchema)
  .handler(async ({ context, data }) => {
    await requireTourAccessByNanoId(data.nanoId, context.user.id)

    const { nanoId, locale, ...input } = data
    return updateTourLocaleDraft(nanoId, locale, input, context.user.id)
  })
