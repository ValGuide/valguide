import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireGuideAccessByNanoId } from '../../auth/authorization'
import { requireAuthMiddleware } from '../../auth/middleware'
import { publishGuideStructure } from './publish-structure.server'

export type { PublishStructureResult } from './publish-structure.server'

const publishStructureSchema = z.object({
  nanoId: z.string(),
})

export const publishGuideStructureFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(publishStructureSchema)
  .handler(async ({ context, data }) => {
    await requireGuideAccessByNanoId(data.nanoId, context.user.id)

    return publishGuideStructure(data.nanoId)
  })
