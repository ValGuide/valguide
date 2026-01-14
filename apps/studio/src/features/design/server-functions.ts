import { createServerFn } from '@tanstack/react-start'
import { requireOrgMember, requireThemeAccess } from '@valguide/core/features/auth/authorization'
import { requireAuthMiddleware } from '@valguide/core/features/auth/middleware'
import { db } from '@valguide/core/features/db'
import { getUserTeams } from '@valguide/core/features/orgs/queries'
import {
  type CreateThemeInput,
  createTheme,
  deleteTheme,
  type UpdateThemeInput,
  updateTheme,
} from '@valguide/core/features/themes/mutations'
import { getOrgThemes } from '@valguide/core/features/themes/queries'
import type { ThemeColors, ThemeFonts, ThemePreset } from '@valguide/core/features/themes/types'
import { handleError } from '@valguide/core/utils/server-fn-error-handler'
import { getActiveTeamId, getActiveTeamSlug } from '@valguide/features/utils/cookies.ts'
import { z } from 'zod'

// Get themes for organization
const getThemesInputSchema = z.object({
  organizationId: z.string().optional(),
})

export const getThemesFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getThemesInputSchema)
  .handler(
    handleError(async ({ context, data }) => {
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
        // Try team ID first (new approach), fall back to slug (backward compat)
        const activeTeamId = getActiveTeamId()
        if (activeTeamId) {
          const team = userTeams.find((t: { id: string }) => t.id === activeTeamId)
          if (team) {
            targetOrganizationId = team.id
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
      }

      if (!targetOrganizationId) {
        targetOrganizationId = userTeams[0].id
      }

      return await getOrgThemes(targetOrganizationId as string)
    }),
  )

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
  .middleware([requireAuthMiddleware])
  .inputValidator(createThemeInputSchema)
  .handler(
    handleError(async ({ context, data }) => {
      const { organizationId, name, basePreset, colors, radius, fonts } = data

      await requireOrgMember(organizationId, context.user.id)

      const input: CreateThemeInput = {
        organizationId,
        name: name.trim(),
        basePreset: basePreset as ThemePreset,
        colors: colors as ThemeColors,
        radius,
        fonts: fonts as ThemeFonts,
        createdBy: context.user.id,
      }

      return await createTheme(input)
    }),
  )

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
  .middleware([requireAuthMiddleware])
  .inputValidator(updateThemeInputSchema)
  .handler(
    handleError(async ({ context, data }) => {
      const { id, name, basePreset, colors, radius, fonts } = data

      await requireThemeAccess(id, context.user.id)

      const input: UpdateThemeInput = { id }

      if (name !== undefined) input.name = name.trim()
      if (basePreset !== undefined) input.basePreset = basePreset as ThemePreset
      if (colors !== undefined) input.colors = colors as ThemeColors
      if (radius !== undefined) input.radius = radius
      if (fonts !== undefined) input.fonts = fonts as ThemeFonts

      return await updateTheme(input)
    }),
  )

// Delete theme
const deleteThemeInputSchema = z.object({
  id: z.string(),
})

export const deleteThemeFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(deleteThemeInputSchema)
  .handler(
    handleError(async ({ context, data }) => {
      const { id } = data

      await requireThemeAccess(id, context.user.id)

      await deleteTheme(id)

      return { success: true }
    }),
  )
