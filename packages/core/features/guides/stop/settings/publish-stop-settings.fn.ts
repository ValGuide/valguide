import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireStopAccessByNanoId } from '../../../auth/authorization'
import { requireAuthMiddleware } from '../../../auth/middleware'
import { publishStopSettings } from './publish-stop-settings.server'

export type { PublishStopSettingsResult } from './publish-stop-settings.server'

const publishStopSettingsSchema = z.object({
	nanoId: z.string(),
})

export const publishStopSettingsFn = createServerFn({ method: 'POST' })
	.middleware([requireAuthMiddleware])
	.inputValidator(publishStopSettingsSchema)
	.handler(async ({ context, data }) => {
		await requireStopAccessByNanoId(data.nanoId, context.user.id)

		return publishStopSettings(data.nanoId, context.user.id)
	})
