import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { captureStudioProductEvent } from '../../../posthog/server'
import { requireAuthMiddleware } from '../../auth/middleware'
import { getTourByNanoId } from './get-tour.server'
import { updateTour } from './update-tour.server'

export type { UpdateTourInput, UpdateTourResult } from './update-tour.server'

// =============================================================================
// SERVER FUNCTION
// =============================================================================

const updateTourSchema = z.object({
  nanoId: z.string(),
  availableLocales: z.array(z.string()).optional(),
  addLocale: z.string().optional(),
  removeLocale: z.string().optional(),
})

export const updateTourFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(updateTourSchema)
  .handler(async ({ context, data }) => {
    const before = await getTourByNanoId(data.nanoId)
    const result = await updateTour(data, context.user.id)
    const previousLocales = before?.availableLocales ?? []
    const addedLocales = result.availableLocales.filter((locale) => !previousLocales.includes(locale))
    const removedLocales = previousLocales.filter((locale) => !result.availableLocales.includes(locale))

    for (const locale of addedLocales) {
      await captureStudioProductEvent({
        distinctId: context.user.id,
        event: 'tour.locale_added',
        properties: {
          tour_nano_id: data.nanoId,
          locale,
        },
      })
    }

    for (const locale of removedLocales) {
      await captureStudioProductEvent({
        distinctId: context.user.id,
        event: 'tour.locale_removed',
        properties: {
          tour_nano_id: data.nanoId,
          locale,
        },
      })
    }

    return result
  })
