import { createServerFn } from '@tanstack/react-start'
import { db } from '@valguide/core/features/db'
import { getStopsByOrganizationId } from '@valguide/core/features/guides/stop-queries'
import { getUserTeams } from '@valguide/core/features/orgs/queries'
import { handleError } from '@valguide/core/utils/server-fn-error-handler'
import { getActiveTeamSlug } from '@valguide/features/utils/cookies.ts'
import { createClient } from '@valguide/supabase/server'
import { z } from 'zod'

const getStopsInputSchema = z.object({
  organizationId: z.string().optional(),
})

export const getStopsFn = createServerFn({ method: 'GET' })
  .inputValidator(getStopsInputSchema)
  .handler(
    handleError(async ({ data }) => {
      const supabase = await createClient()
      const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()

      if (claimsError || !claimsData?.claims?.sub) {
        throw new Error('Unauthorized')
      }

      const userId = claimsData.claims.sub
      const queryOrganizationId = data.organizationId

      const userTeams = await getUserTeams(db, userId)

      if (userTeams.length === 0) {
        return []
      }

      let targetOrganizationId: string | undefined

      if (queryOrganizationId) {
        const hasAccess = userTeams.some((t: { id: string }) => t.id === queryOrganizationId)
        if (hasAccess) {
          targetOrganizationId = queryOrganizationId
        }
      }

      if (!targetOrganizationId) {
        const activeTeamSlug = getActiveTeamSlug()

        if (activeTeamSlug) {
          const team = userTeams.find((t: { id: string; slug: string }) => t.slug === activeTeamSlug)
          if (team) {
            targetOrganizationId = team.id
          }
        }
      }

      if (!targetOrganizationId) {
        targetOrganizationId = userTeams[0].id
      }

      const stops = await getStopsByOrganizationId(targetOrganizationId as string)

      return stops
    }),
  )
