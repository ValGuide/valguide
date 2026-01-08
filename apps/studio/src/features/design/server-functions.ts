import { createServerFn } from '@tanstack/react-start'
import { db } from '@valguide/core/features/db'
import { getUserTeams } from '@valguide/core/features/orgs/queries'
import {
  createTheme,
  type CreateThemeInput,
  deleteTheme,
  updateTheme,
  type UpdateThemeInput,
} from '@valguide/core/features/themes/mutations'
import { getFullThemeById, getOrgThemes } from '@valguide/core/features/themes/queries'
import type { ThemeColors, ThemeFonts, ThemePreset } from '@valguide/core/features/themes/types'
import { createClient } from '@valguide/supabase/server'
import { z } from 'zod'
import { getActiveTeamSlug } from '@valguide/features/utils/cookies.ts'

// Get themes for organization
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

    return await getOrgThemes(targetOrganizationId as string)
  })

// Create theme - uses any for colors/fonts since Zod can't validate complex types well
const createThemeInputSchema = z.object({
  organizationId: z.string(),
  name: z.string().min(1),
  basePreset: z.string(),
  colors: z.any(),
  radius: z.number(),
  fonts: z.any(),
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
      basePreset: basePreset as ThemePreset,
      colors: colors as ThemeColors,
      radius,
      fonts: fonts as ThemeFonts,
      createdBy: userId,
    }

    return await createTheme(input)
  })

// Update theme
const updateThemeInputSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  basePreset: z.string().optional(),
  colors: z.any().optional(),
  radius: z.number().optional(),
  fonts: z.any().optional(),
})

export const updateThemeFn = createServerFn({ method: 'POST' })
  .inputValidator(updateThemeInputSchema)
  .handler(async ({ data }) => {
    const { id, name, basePreset, colors, radius, fonts } = data

    const supabase = await createClient()
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()

    if (claimsError || !claimsData?.claims?.sub) {
      throw new Error('Unauthorized')
    }

    const userId = claimsData.claims.sub

    const existingTheme = await getFullThemeById(id)

    if (!existingTheme) {
      throw new Error('Theme not found')
    }

    const userTeams = await getUserTeams(db, userId)
    const hasAccess = userTeams.some((t: { id: string }) => t.id === existingTheme.organizationId)

    if (!hasAccess) {
      throw new Error('You do not have access to this theme')
    }

    const input: UpdateThemeInput = { id }

    if (name !== undefined) input.name = name.trim()
    if (basePreset !== undefined) input.basePreset = basePreset as ThemePreset
    if (colors !== undefined) input.colors = colors as ThemeColors
    if (radius !== undefined) input.radius = radius
    if (fonts !== undefined) input.fonts = fonts as ThemeFonts

    return await updateTheme(input)
  })

// Delete theme
const deleteThemeInputSchema = z.object({
  id: z.string(),
})

export const deleteThemeFn = createServerFn({ method: 'POST' })
  .inputValidator(deleteThemeInputSchema)
  .handler(async ({ data }) => {
    const { id } = data

    const supabase = await createClient()
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()

    if (claimsError || !claimsData?.claims?.sub) {
      throw new Error('Unauthorized')
    }

    const userId = claimsData.claims.sub

    const existingTheme = await getFullThemeById(id)

    if (!existingTheme) {
      throw new Error('Theme not found')
    }

    const userTeams = await getUserTeams(db, userId)
    const hasAccess = userTeams.some((t: { id: string }) => t.id === existingTheme.organizationId)

    if (!hasAccess) {
      throw new Error('You do not have access to this theme')
    }

    await deleteTheme(id)

    return { success: true }
  })
