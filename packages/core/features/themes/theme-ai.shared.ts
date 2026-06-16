import { z } from 'zod'
import { createThemeFont, getThemeFontDefinition } from './fonts'
import { themeColorPresets } from './presets'
import type { ThemeColors, ThemeConfig, ThemePreset } from './types'
import { themePresets } from './types'

const hexColorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/)

const themeAiRadiusSchema = z.union([z.literal(0), z.literal(0.5), z.literal(1.5), z.literal(2)])

export const themeAiSourceImageSchema = z.object({
  storagePath: z.string().min(1).max(512),
  fileName: z.string().min(1).max(255),
  contentType: z.string().min(1).max(120),
  size: z
    .number()
    .int()
    .positive()
    .max(10 * 1024 * 1024),
})

export type ThemeAiSourceImage = z.infer<typeof themeAiSourceImageSchema>

export const themeAiWebsiteContextSchema = z.object({
  requestedUrl: z.string().url(),
  finalUrl: z.string().url().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  themeColor: hexColorSchema.optional(),
  ogImageUrl: z.string().url().optional(),
  textExcerpt: z.string().optional(),
  error: z.string().optional(),
})

export type ThemeAiWebsiteContext = z.infer<typeof themeAiWebsiteContextSchema>

const partialThemeColorsSchema = z.object({
  background: hexColorSchema.optional(),
  foreground: hexColorSchema.optional(),
  card: hexColorSchema.optional(),
  cardForeground: hexColorSchema.optional(),
  popover: hexColorSchema.optional(),
  popoverForeground: hexColorSchema.optional(),
  primary: hexColorSchema.optional(),
  primaryForeground: hexColorSchema.optional(),
  secondary: hexColorSchema.optional(),
  secondaryForeground: hexColorSchema.optional(),
  muted: hexColorSchema.optional(),
  mutedForeground: hexColorSchema.optional(),
  accent: hexColorSchema.optional(),
  accentForeground: hexColorSchema.optional(),
  destructive: hexColorSchema.optional(),
  destructiveForeground: hexColorSchema.optional(),
  border: hexColorSchema.optional(),
  input: hexColorSchema.optional(),
  ring: hexColorSchema.optional(),
})

export const themeAiModelSuggestionSchema = z.object({
  name: z.string().min(1).max(100).default('Generated Theme'),
  summary: z.string().min(1).max(280).default('AI-assisted theme suggestion'),
  moodKeywords: z.array(z.string().min(1).max(32)).max(6).default([]),
  sourceHighlights: z.array(z.string().min(1).max(160)).max(4).default([]),
  basePreset: z.enum(themePresets).default('gallery'),
  radius: themeAiRadiusSchema,
  fontId: z.string().min(1).max(50).default('noto-sans'),
  colors: partialThemeColorsSchema.default({}),
})

export interface ThemeAiGeneratedTheme extends ThemeConfig {
  name: string
  summary: string
  moodKeywords: string[]
  sourceHighlights: string[]
}

export function normalizeThemeAiSuggestion(input: unknown): ThemeAiGeneratedTheme {
  const parsed = themeAiModelSuggestionSchema.parse(input)
  const fontId = getThemeFontDefinition(parsed.fontId) ? parsed.fontId : 'noto-sans'
  const presetColors = themeColorPresets[parsed.basePreset]

  return {
    name: parsed.name.trim() || 'Generated Theme',
    summary: parsed.summary.trim() || 'AI-assisted theme suggestion',
    moodKeywords: parsed.moodKeywords,
    sourceHighlights: parsed.sourceHighlights,
    basePreset: parsed.basePreset,
    radius: parsed.radius,
    fonts: {
      primary: createThemeFont(fontId),
    },
    colors: {
      ...presetColors,
      ...parsed.colors,
    } satisfies ThemeColors,
  }
}

export const generateThemeAiInputSchema = z
  .object({
    runNanoId: z.string().min(10).max(21),
    sourceUrl: z.string().url().optional(),
    notes: z.string().trim().min(1).max(1500).optional(),
    images: z.array(themeAiSourceImageSchema).max(4).default([]),
  })
  .refine((value) => Boolean(value.sourceUrl || value.notes || value.images.length > 0), {
    message: 'Provide a URL, notes, or at least one inspiration image',
    path: ['sourceUrl'],
  })

export type GenerateThemeAiInput = z.infer<typeof generateThemeAiInputSchema>

export interface ThemeAiWorkspaceGeneration {
  nanoId: string
  status: 'pending' | 'completed' | 'failed'
  createdAt: Date
  sourceUrl: string | null
  sourceImageCount: number
  themeName: string | null
  summary: string | null
  basePreset: ThemePreset | null
  fontLabel: string | null
  errorMessage: string | null
}

export interface ThemeAiWorkspaceData {
  organizationNanoId: string
  recentGenerations: ThemeAiWorkspaceGeneration[]
}
