import { createServerFn } from '@tanstack/react-start'
import { db } from '@valguide/core/features/db'
import {
  createGuide,
  getArchivedGuides,
  getGuideByNanoIdWithAssets,
  getGuidesByOrganizationId,
} from '@valguide/core/features/guides/queries'
import { getUserTeams } from '@valguide/core/features/orgs/queries'
import { supportedLocales } from '@valguide/core/i18n/i18n.config'
import { createClient } from '@valguide/supabase/server'
import { z } from 'zod'
import { getActiveTeamSlug } from '../../utils/cookies'

// Get guide by nanoId
const getGuideByNanoIdInputSchema = z.object({
  nanoId: z.string(),
})

export const getGuideByNanoIdFn = createServerFn({ method: 'GET' })
  .inputValidator(getGuideByNanoIdInputSchema)
  .handler(async ({ data }) => {
    const { nanoId } = data

    const supabase = await createClient()
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()

    if (claimsError || !claimsData?.claims?.sub) {
      throw new Error('Unauthorized')
    }

    const guide = await getGuideByNanoIdWithAssets(db, nanoId)

    if (!guide) {
      throw new Error('Not found')
    }

    return guide
  })

// Get guides for current organization
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

    const guides = await getGuidesByOrganizationId(db, targetOrganizationId as string)

    return guides
  })

// Get archived guides
export const getArchivedGuidesFn = createServerFn({ method: 'GET' }).handler(async () => {
  const supabase = await createClient()
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()

  if (claimsError || !claimsData?.claims?.sub) {
    throw new Error('Unauthorized')
  }

  const userId = claimsData.claims.sub

  const guides = await getArchivedGuides(db, userId)

  return {
    guides,
    userId,
  }
})

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
        const activeTeamSlug = getActiveTeamSlug()

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
  })
