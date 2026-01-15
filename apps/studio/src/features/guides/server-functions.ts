import { createServerFn } from '@tanstack/react-start'
import { db } from '@valguide/core/features/db'
import {
  createGuide,
  getArchivedGuidesWithCover,
  getGuidesByOrganizationId,
} from '@valguide/core/features/guides/queries'
import { getUserTeams } from '@valguide/core/features/orgs/queries'
import { supportedLocales } from '@valguide/core/i18n/i18n.config'
import { handleError } from '@valguide/core/utils/server-fn-error-handler'
import { requireAuthMiddleware } from '@valguide/features/auth/middleware'
import { z } from 'zod'

// Get guides for current organization
const getGuidesInputSchema = z.object({
  organizationId: z.string().optional(),
})

export const getGuidesFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getGuidesInputSchema)
  .handler(
    handleError(async ({ data, context }) => {
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
          const team = userTeams.find((t: { id: string; slug: string }) => t.id === activeTeamId)
          if (team) {
            targetOrganizationId = team.id
          }
        }
      }

      if (!targetOrganizationId) {
        targetOrganizationId = userTeams[0].id
      }

      const guides = await getGuidesByOrganizationId(db, targetOrganizationId as string)

      return guides
    }),
  )

// Get archived guides for the current organization
export const getArchivedGuidesFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .handler(
    handleError(async ({ context }) => {
      const userId = context.user.id
      const userTeams = await getUserTeams(db, userId)

      if (userTeams.length === 0) {
        return { guides: [], userId }
      }

      const activeTeamId = context.activeOrgId
      let targetOrganizationId = userTeams[0].id

      if (activeTeamId) {
        const team = userTeams.find((t: { id: string; slug: string }) => t.id === activeTeamId)
        if (team) {
          targetOrganizationId = team.id
        }
      }

      const guides = await getArchivedGuidesWithCover(db, targetOrganizationId)

      return {
        guides,
        userId,
      }
    }),
  )

// Create guide
const createGuideInputSchema = z.object({
  translations: z.array(
    z.object({
      locale: z.string(),
      title: z.string(),
      description: z.string().optional(),
    }),
  ),
  organizationId: z.string().optional(),
})

export const createGuideFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(createGuideInputSchema)
  .handler(
    handleError(async ({ data, context }) => {
      const userId = context.user.id
      let { translations, organizationId } = data

      if (!organizationId) {
        const userTeams = await getUserTeams(db, userId)
        if (userTeams && userTeams.length > 0) {
          const activeTeamId = context.activeOrgId

          if (activeTeamId) {
            const team = userTeams.find((t: { id: string; slug: string }) => t.id === activeTeamId)
            if (team) {
              organizationId = team.id
            }
          }

          if (!organizationId) {
            organizationId = userTeams[0].id
          }
        }
      }

      if (!organizationId) {
        throw new Error('Organization is required to create a guide. Please create an organization first.')
      }

      if (!translations || !Array.isArray(translations) || translations.length === 0) {
        throw new Error('At least one translation is required')
      }

      for (const translation of translations) {
        if (!translation.locale || !translation.title) {
          throw new Error('Each translation must have a locale and title')
        }

        if (!(supportedLocales as readonly string[]).includes(translation.locale)) {
          throw new Error(`Unsupported locale: ${translation.locale}`)
        }
      }

      const newGuide = await createGuide(
        db,
        {
          createdBy: userId,
          updatedBy: userId,
          organizationId,
        },
        translations,
      )

      return newGuide
    }),
  )
