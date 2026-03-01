import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getInvitationData } from './get-invitation-data.server'

export type { InvitationData } from './get-invitation-data.server'

const getInvitationDataSchema = z.object({
  invitationId: z.string().optional(),
})

export const getInvitationDataFn = createServerFn({ method: 'GET' })
  .inputValidator(getInvitationDataSchema)
  .handler(async ({ data }) => {
    return getInvitationData(data.invitationId)
  })
