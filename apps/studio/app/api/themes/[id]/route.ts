import { createServerFn } from '@tanstack/react-start'
import { db } from '@valguide/core/features/db'
import { getUserTeams } from '@valguide/core/features/orgs/queries'
import { deleteTheme, type UpdateThemeInput, updateTheme } from '@valguide/core/features/themes/mutations'
import { getFullThemeById } from '@valguide/core/features/themes/queries'
import { createClient } from '@valguide/supabase/server'
import { z } from 'zod'

const getThemeByIdInputSchema = z.object({
  id: z.string(),
})

export const getThemeByIdFn = createServerFn({ method: 'GET' })
  .inputValidator(getThemeByIdInputSchema)
  .handler(async ({ data }) => {
    const { id } = data

    const supabase = await createClient()
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()

    if (claimsError || !claimsData?.claims?.sub) {
      throw new Error('Unauthorized')
    }

    const userId = claimsData.claims.sub

    const theme = await getFullThemeById(id)

    if (!theme) {
      throw new Error('Theme not found')
    }

    const userTeams = await getUserTeams(db, userId)
    const hasAccess = userTeams.some((t: { id: string }) => t.id === theme.organizationId)

    if (!hasAccess) {
      throw new Error('You do not have access to this theme')
    }

    return theme
  })

const updateThemeInputSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  basePreset: z.string().optional(),
  colors: z.record(z.string()).optional(),
  radius: z.number().optional(),
  fonts: z.record(z.string()).optional(),
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
    if (basePreset !== undefined) input.basePreset = basePreset
    if (colors !== undefined) input.colors = colors
    if (radius !== undefined) input.radius = radius
    if (fonts !== undefined) input.fonts = fonts

    const updated = await updateTheme(input)

    return updated
  })

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
