import { createServerFn } from '@tanstack/react-start'
import { db } from '@valguide/core/features/db'
import { getStopMetadataByNanoId } from '@valguide/core/features/guides/stop-queries'
import { getUserTeams } from '@valguide/core/features/orgs/get-user-teams'
import { requireAuthMiddleware } from '@valguide/features/auth/middleware'
import { z } from 'zod'

// ============================================================================
// SERVER FUNCTION
// ============================================================================

const getStopMetadataInputSchema = z.object({
  nanoId: z.string(),
})

export const getStopMetadataFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getStopMetadataInputSchema)
  .handler(async ({ data, context }) => {
    const userId = context.user.id
    const userTeams = await getUserTeams(db, userId)

    if (userTeams.length === 0) {
      throw new Error('Unauthorized')
    }

    const metadata = await getStopMetadataByNanoId(data.nanoId)

    if (!metadata) {
      throw new Error('Stop not found')
    }

    const hasAccess = userTeams.some((t: { id: string }) => t.id === metadata.organizationId)
    if (!hasAccess) {
      throw new Error('Unauthorized')
    }

    return metadata
  })
