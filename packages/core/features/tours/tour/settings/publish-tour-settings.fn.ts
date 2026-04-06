import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireTourAccessByNanoId } from '../../../auth/authorization'
import { requireAuthMiddleware } from '../../../auth/middleware'
import { getPublishedTourByNanoId } from '../../public/get-published-tour'
import { writeTourSharedToKv } from '../../public/kv'
import { serializeTourSharedForKv } from '../../public/kv-serializers'
import { publishTourSettings } from './publish-tour-settings.server'

export type { PublishTourSettingsResult } from './publish-tour-settings.server'

const publishTourSettingsSchema = z.object({
  nanoId: z.string(),
})

export const publishTourSettingsFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(publishTourSettingsSchema)
  .handler(async ({ context, data }) => {
    await requireTourAccessByNanoId(data.nanoId, context.user.id)

    const result = await publishTourSettings(data.nanoId, context.user.id)

    const fullTour = await getPublishedTourByNanoId(data.nanoId)
    const sharedTourKv = fullTour ? serializeTourSharedForKv(fullTour) : null

    if (sharedTourKv) {
      await writeTourSharedToKv(data.nanoId, sharedTourKv)
    }

    return result
  })
