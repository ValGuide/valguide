import { createServerFn } from '@tanstack/react-start'
import { db } from '@valguide/core/features/db'
import {
  getStopDetailByNanoId,
  getStopMetadataByNanoId,
  getStopsByOrganizationId,
  getStopTranslationForLocale,
} from '@valguide/core/features/guides/stop-queries'
import { getUserTeams } from '@valguide/core/features/orgs/get-user-teams'
import { requireAuthMiddleware } from '@valguide/features/auth/middleware'
import { z } from 'zod'

const getStopsInputSchema = z.object({
  organizationId: z.string().optional(),
})

export const getStopsFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getStopsInputSchema)
  .handler(async ({ data, context }) => {
    const userId = context.user.id
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
      const activeTeamId = context.activeOrgId

      if (activeTeamId) {
        const team = userTeams.find((t: { id: string }) => t.id === activeTeamId)
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
  })

// ============================================================================
// Independent Stop Editing Server Functions
// ============================================================================

const getStopMetadataInputSchema = z.object({
  nanoId: z.string(),
})

/**
 * Get stop metadata for independent editing (editor shell data)
 */
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

    // Verify user has access to this stop's organization
    const hasAccess = userTeams.some((t: { id: string }) => t.id === metadata.organizationId)
    if (!hasAccess) {
      throw new Error('Unauthorized')
    }

    return metadata
  })

const getStopLocaleDataInputSchema = z.object({
  stopId: z.string(),
  locale: z.string(),
})

/**
 * Get stop translation for a single locale (for per-locale fetching in editor)
 */
export const getStopLocaleDataFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getStopLocaleDataInputSchema)
  .handler(async ({ data }) => {
    // Note: Authorization is handled at the metadata level - if user can see metadata, they can see translations
    const localeData = await getStopTranslationForLocale(data.stopId, data.locale)
    return localeData
  })

const getStopDetailInputSchema = z.object({
  nanoId: z.string(),
  preferredLocale: z.string().optional(),
})

/**
 * Get stop detail for overview page
 */
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

    // Verify user has access to this stop's organization
    const hasAccess = userTeams.some((t: { id: string }) => t.id === detail.organizationId)
    if (!hasAccess) {
      throw new Error('Unauthorized')
    }

    return detail
  })
