import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { captureStudioProductEvent } from '../../../posthog/server'
import { requireStopAccessByNanoId } from '../../auth/authorization'
import { requireAuthMiddleware } from '../../auth/middleware'
import { getStop } from './get-stop.server'
import { updateStop } from './update-stop.server'

export type { UpdateStopInput, UpdateStopResult } from './update-stop.server'

const updateStopSchema = z.object({
  nanoId: z.string(),
  availableLocales: z.array(z.string()).optional(),
})

export const updateStopFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(updateStopSchema)
  .handler(async ({ context, data }) => {
    const before = await getStop(data.nanoId)
    const { stopId } = await requireStopAccessByNanoId(data.nanoId, context.user.id)
    const result = await updateStop(stopId, { availableLocales: data.availableLocales }, context.user.id)
    const previousLocales = before?.availableLocales ?? []
    const addedLocales = result.availableLocales.filter((locale) => !previousLocales.includes(locale))
    const removedLocales = previousLocales.filter((locale) => !result.availableLocales.includes(locale))

    for (const locale of addedLocales) {
      await captureStudioProductEvent({
        distinctId: context.user.id,
        event: 'stop.locale_added',
        properties: {
          stop_nano_id: data.nanoId,
          locale,
        },
      })
    }

    for (const locale of removedLocales) {
      await captureStudioProductEvent({
        distinctId: context.user.id,
        event: 'stop.locale_removed',
        properties: {
          stop_nano_id: data.nanoId,
          locale,
        },
      })
    }

    return result
  })
