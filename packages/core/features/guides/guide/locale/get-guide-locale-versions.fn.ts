import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { NotFoundError, requireGuideAccessByNanoId } from '../../../auth/authorization'
import { requireAuthMiddleware } from '../../../auth/middleware'
import { getGuideVersions } from './get-guide-locale-versions.server'

export type { GetGuideVersionsResult, GuideLocaleVersionInfo } from './get-guide-locale-versions.server'

const getGuideVersionsSchema = z.object({
  nanoId: z.string(),
  locale: z.string(),
})

export const getGuideVersionsFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getGuideVersionsSchema)
  .handler(async ({ context, data }) => {
    await requireGuideAccessByNanoId(data.nanoId, context.user.id)

    const result = await getGuideVersions(data.nanoId, data.locale)
    if (!result) {
      throw new NotFoundError('Guide locale')
    }

    return result
  })
