import { createServerFn } from '@tanstack/react-start'
import { db } from '@valguide/core/features/db'
import { getStopDetailByNanoId } from '@valguide/core/features/guides/stop-queries'
import { getUserTeams } from '@valguide/core/features/orgs/get-user-teams'
import { requireAuthMiddleware } from '@valguide/features/auth/middleware'
import { z } from 'zod'

// ============================================================================
// SERVER FUNCTION
// ============================================================================

const getStopDetailInputSchema = z.object({
  nanoId: z.string(),
  preferredLocale: z.string().optional(),
})

export const getStopDetailFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getStopDetailInputSchema)
  .handler(async ({ data, context }) => {
    const userId = context.user.id
    const userTeams = await getUserTeams(db, userId)

    if (userTeams.length === 0) {
      throw new Error('Unauthorized')
    }

    const detail = await getStopDetailByNanoId(data.nanoId, data.preferredLocale ?? 'en')

    if (!detail) {
      throw new Error('Stop not found')
    }

    const hasAccess = userTeams.some((t: { id: string }) => t.id === detail.organizationId)
    if (!hasAccess) {
      throw new Error('Unauthorized')
    }

    return detail
  })
