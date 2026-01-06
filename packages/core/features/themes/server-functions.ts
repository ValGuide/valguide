import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { createTheme, deleteTheme, duplicateTheme, setGuideTheme, setOrgDefaultTheme, updateTheme } from './mutations'
import {
  getEffectiveGuideTheme,
  getFullThemeById,
  getGuideTheme,
  getOrgDefaultTheme,
  getOrgThemes,
  getThemeById,
  getThemeByName,
} from './queries'
import { fontSources, themePresets } from './types'

export { DEFAULT_THEME } from './queries'

const themeIdSchema = z.object({ themeId: z.string() })
const organizationIdSchema = z.object({ organizationId: z.string() })
const guideIdSchema = z.object({ guideId: z.string() })

const themeFontSchema = z.object({
  source: z.enum(fontSources),
  family: z.string(),
  fallback: z.string().optional(),
})

const themeColorsSchema = z.object({
  background: z.string(),
  foreground: z.string(),
  card: z.string(),
  cardForeground: z.string(),
  popover: z.string(),
  popoverForeground: z.string(),
  primary: z.string(),
  primaryForeground: z.string(),
  secondary: z.string(),
  secondaryForeground: z.string(),
  muted: z.string(),
  mutedForeground: z.string(),
  accent: z.string(),
  accentForeground: z.string(),
  destructive: z.string(),
  destructiveForeground: z.string(),
  border: z.string(),
  input: z.string(),
  ring: z.string(),
})

const themeFontsSchema = z.object({
  primary: themeFontSchema,
  overrides: z
    .object({
      heading: themeFontSchema.optional(),
      body: themeFontSchema.optional(),
      caption: themeFontSchema.optional(),
    })
    .optional(),
})

const createThemeInputSchema = z.object({
  organizationId: z.string(),
  name: z.string(),
  basePreset: z.enum(themePresets),
  colors: themeColorsSchema,
  radius: z.number(),
  fonts: themeFontsSchema,
  createdBy: z.string().optional(),
})

const updateThemeInputSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  basePreset: z.enum(themePresets).optional(),
  colors: themeColorsSchema.optional(),
  radius: z.number().optional(),
  fonts: themeFontsSchema.optional(),
})

export const getThemeByIdFn = createServerFn({ method: 'GET' })
  .inputValidator(themeIdSchema)
  .handler(async ({ data }) => getThemeById(data.themeId))

export const getFullThemeByIdFn = createServerFn({ method: 'GET' })
  .inputValidator(themeIdSchema)
  .handler(async ({ data }) => getFullThemeById(data.themeId))

export const getOrgThemesFn = createServerFn({ method: 'GET' })
  .inputValidator(organizationIdSchema)
  .handler(async ({ data }) => getOrgThemes(data.organizationId))

export const getOrgDefaultThemeFn = createServerFn({ method: 'GET' })
  .inputValidator(organizationIdSchema)
  .handler(async ({ data }) => getOrgDefaultTheme(data.organizationId))

export const getGuideThemeFn = createServerFn({ method: 'GET' })
  .inputValidator(guideIdSchema)
  .handler(async ({ data }) => getGuideTheme(data.guideId))

export const getEffectiveGuideThemeFn = createServerFn({ method: 'GET' })
  .inputValidator(guideIdSchema)
  .handler(async ({ data }) => getEffectiveGuideTheme(data.guideId))

export const getThemeByNameFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ organizationId: z.string(), name: z.string() }))
  .handler(async ({ data }) => getThemeByName(data.organizationId, data.name))

export const createThemeFn = createServerFn({ method: 'POST' })
  .inputValidator(createThemeInputSchema)
  .handler(async ({ data }) => createTheme(data))

export const updateThemeFn = createServerFn({ method: 'POST' })
  .inputValidator(updateThemeInputSchema)
  .handler(async ({ data }) => updateTheme(data))

export const deleteThemeFn = createServerFn({ method: 'POST' })
  .inputValidator(themeIdSchema)
  .handler(async ({ data }) => deleteTheme(data.themeId))

export const setOrgDefaultThemeFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ organizationId: z.string(), themeId: z.string().nullable() }))
  .handler(async ({ data }) => setOrgDefaultTheme(data.organizationId, data.themeId))

export const setGuideThemeFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ guideId: z.string(), themeId: z.string().nullable() }))
  .handler(async ({ data }) => setGuideTheme(data.guideId, data.themeId))

export const duplicateThemeFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ themeId: z.string(), newName: z.string(), createdBy: z.string().optional() }))
  .handler(async ({ data }) => duplicateTheme(data.themeId, data.newName, data.createdBy))
