import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { NotFoundError, requireGuideAccessByNanoId } from '../../../auth/authorization'
import { requireAuthMiddleware } from '../../../auth/middleware'
import { getGuideLocaleDraft } from './get-guide-locale-draft.server'

export type { GuideLocaleDraftResult } from './get-guide-locale-draft.server'

const getGuideLocaleDraftSchema = z.object({
  nanoId: z.string(),
  locale: z.string(),
})

export const getGuideLocaleDraftFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getGuideLocaleDraftSchema)
  .handler(async ({ context, data }) => {
    await requireGuideAccessByNanoId(data.nanoId, context.user.id)

    const draft = await getGuideLocaleDraft(data.nanoId, data.locale)
    if (!draft) {
      throw new NotFoundError('Guide locale')
    }

    return draft
  })
