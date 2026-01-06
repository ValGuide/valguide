import { createServerFn } from '@tanstack/react-start'
import { db } from '@valguide/core/features/db'
import { createGuide, getGuidesByOrganizationId } from '@valguide/core/features/guides/queries'
import { getUserTeams } from '@valguide/core/features/orgs/queries'
import { supportedLocales } from '@valguide/i18n/i18n.config'
import { createClient } from '@valguide/supabase/server'
import { cookies } from 'next/headers'
import { z } from 'zod'

const getGuidesInputSchema = z.object({
  organizationId: z.string().optional(),
})

export const getGuidesFn = createServerFn({ method: 'GET' })
  .inputValidator(getGuidesInputSchema)
  .handler(async ({ data }) => {
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
      const cookieStore = await cookies()
      const activeTeamSlug = cookieStore.get('active-team-slug')?.value

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

    const guides = await getGuidesByOrganizationId(db, targetOrganizationId as string)

    return guides
  })

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
  .inputValidator(createGuideInputSchema)
  .handler(async ({ data }) => {
    const supabase = await createClient()
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()

    if (claimsError || !claimsData?.claims?.sub) {
      throw new Error('Unauthorized')
    }

    const userId = claimsData.claims.sub
    let { translations, organizationId } = data

    if (!organizationId) {
      const userTeams = await getUserTeams(db, userId)
      if (userTeams && userTeams.length > 0) {
        const cookieStore = await cookies()
        const activeTeamSlug = cookieStore.get('active-team-slug')?.value

        if (activeTeamSlug) {
          const team = userTeams.find((t: { id: string; slug: string }) => t.slug === activeTeamSlug)
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

      if (!supportedLocales.includes(translation.locale)) {
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
  })
