import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireStopAccessByNanoId } from '../../../auth/authorization'
import { requireAuthMiddleware } from '../../../auth/middleware'
import { getStopSettingsDraft } from './get-stop-settings-draft.server'

export type { StopSettingsDraftResult } from './get-stop-settings-draft.server'

const getStopSettingsDraftSchema = z.object({
	nanoId: z.string(),
})

export const getStopSettingsDraftFn = createServerFn({ method: 'GET' })
	.middleware([requireAuthMiddleware])
	.inputValidator(getStopSettingsDraftSchema)
	.handler(async ({ context, data }) => {
		await requireStopAccessByNanoId(data.nanoId, context.user.id)

		return getStopSettingsDraft(data.nanoId)
	})
