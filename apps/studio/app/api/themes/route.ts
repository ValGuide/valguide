import { createServerFn } from '@tanstack/react-start'
import { db } from '@valguide/core/features/db'
import { getUserTeams } from '@valguide/core/features/orgs/queries'
import { type CreateThemeInput, createTheme } from '@valguide/core/features/themes/mutations'
import { getOrgThemes } from '@valguide/core/features/themes/queries'
import { createClient } from '@valguide/supabase/server'
import { cookies } from 'next/headers'
import { z } from 'zod'

const getThemesInputSchema = z.object({
  organizationId: z.string().optional(),
})

export const getThemesFn = createServerFn({ method: 'GET' })
  .inputValidator(getThemesInputSchema)
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

    const themes = await getOrgThemes(targetOrganizationId as string)

    return themes
  })

const createThemeInputSchema = z.object({
  organizationId: z.string(),
  name: z.string().min(1),
  basePreset: z.string(),
  colors: z.record(z.string()),
  radius: z.number(),
  fonts: z.record(z.string()),
})

export const createThemeFn = createServerFn({ method: 'POST' })
  .inputValidator(createThemeInputSchema)
  .handler(async ({ data }) => {
    const supabase = await createClient()
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()

    if (claimsError || !claimsData?.claims?.sub) {
      throw new Error('Unauthorized')
    }

    const userId = claimsData.claims.sub
    const { organizationId, name, basePreset, colors, radius, fonts } = data

    const userTeams = await getUserTeams(db, userId)
    const hasAccess = userTeams.some((t: { id: string }) => t.id === organizationId)

    if (!hasAccess) {
      throw new Error('You do not have access to this organization')
    }

    const input: CreateThemeInput = {
      organizationId,
      name: name.trim(),
      basePreset,
      colors,
      radius,
      fonts,
      createdBy: userId,
    }

    const theme = await createTheme(input)

    return theme
  })
