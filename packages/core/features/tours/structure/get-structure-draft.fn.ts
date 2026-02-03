import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { NotFoundError, requireTourAccessByNanoId } from '../../auth/authorization'
import { requireAuthMiddleware } from '../../auth/middleware'
import { getStructureDraft } from './get-structure-draft.server'

export type { StructureDraftResult, StructureDraftStop } from './get-structure-draft.server'

const getStructureDraftSchema = z.object({
  nanoId: z.string(),
  locale: z.string().default('en'),
})

export const getStructureDraftFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getStructureDraftSchema)
  .handler(async ({ context, data }) => {
    await requireTourAccessByNanoId(data.nanoId, context.user.id)

    const result = await getStructureDraft(data.nanoId, data.locale)
    if (!result) {
      throw new NotFoundError('Tour')
    }

    return result
  })
