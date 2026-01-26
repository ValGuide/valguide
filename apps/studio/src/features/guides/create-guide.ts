import { createServerFn } from '@tanstack/react-start'
import { db } from '@valguide/core/features/db'
import { createGuide } from '@valguide/core/features/guides/queries'
import { getUserTeams } from '@valguide/core/features/orgs/get-user-teams'
import { supportedLocales } from '@valguide/core/i18n/i18n.config'
import { requireAuthMiddleware } from '@valguide/features/auth/middleware'
import { z } from 'zod'

// ============================================================================
// SERVER FUNCTION
// ============================================================================

const createGuideInputSchema = z.object({
  translations: z.array(
    z.object({
      locale: z.string(),
    }),
  ),
  organizationId: z.string().optional(),
})

export const createGuideFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(createGuideInputSchema)
  .handler(async ({ data, context }) => {
    const userId = context.user.id
    let { translations, organizationId } = data

    if (!organizationId) {
      const userTeams = await getUserTeams(db, userId)
      if (userTeams && userTeams.length > 0) {
        const activeTeamId = context.activeOrgId

        if (activeTeamId) {
          const team = userTeams.find((t: { id: string }) => t.id === activeTeamId)
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
      if (!translation.locale) {
        throw new Error('Each translation must have a locale')
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
        availableLocales: translations.map((t) => t.locale),
      },
      translations,
    )

    return newGuide
  })
