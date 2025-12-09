import { and, eq } from 'drizzle-orm'
import { db } from '../db'
import { guide } from '../guides/schema'
import { organization } from '../orgs/schema'
import { customTheme, type NewCustomTheme } from './schema'
import type { ThemeColors, ThemeFonts, ThemePreset } from './types'

export interface CreateThemeInput {
  organizationId: string
  name: string
  basePreset: ThemePreset
  colors: ThemeColors
  radius: number
  fonts: ThemeFonts
  createdBy?: string
}

export async function createTheme(input: CreateThemeInput) {
  const [theme] = await db
    .insert(customTheme)
    .values({
      organizationId: input.organizationId,
      name: input.name,
      basePreset: input.basePreset,
      colors: input.colors,
      radius: String(input.radius),
      fonts: input.fonts,
      createdBy: input.createdBy,
    } satisfies NewCustomTheme)
    .returning()

  return theme
}

export interface UpdateThemeInput {
  id: string
  name?: string
  basePreset?: ThemePreset
  colors?: ThemeColors
  radius?: number
  fonts?: ThemeFonts
}

export async function updateTheme(input: UpdateThemeInput) {
  const updates: Partial<NewCustomTheme> = {}

  if (input.name !== undefined) updates.name = input.name
  if (input.basePreset !== undefined) updates.basePreset = input.basePreset
  if (input.colors !== undefined) updates.colors = input.colors
  if (input.radius !== undefined) updates.radius = String(input.radius)
  if (input.fonts !== undefined) updates.fonts = input.fonts

  const [theme] = await db.update(customTheme).set(updates).where(eq(customTheme.id, input.id)).returning()

  return theme
}

export async function deleteTheme(themeId: string) {
  await db.update(organization).set({ defaultThemeId: null }).where(eq(organization.defaultThemeId, themeId))

  await db.update(guide).set({ themeId: null }).where(eq(guide.themeId, themeId))

  const [deleted] = await db.delete(customTheme).where(eq(customTheme.id, themeId)).returning()

  return deleted
}

export async function setOrgDefaultTheme(organizationId: string, themeId: string | null) {
  if (themeId) {
    const [theme] = await db
      .select()
      .from(customTheme)
      .where(and(eq(customTheme.id, themeId), eq(customTheme.organizationId, organizationId)))
      .limit(1)

    if (!theme) {
      throw new Error('Theme not found or does not belong to this organization')
    }
  }

  const [org] = await db
    .update(organization)
    .set({ defaultThemeId: themeId })
    .where(eq(organization.id, organizationId))
    .returning()

  return org
}

export async function setGuideTheme(guideId: string, themeId: string | null) {
  if (themeId) {
    const [g] = await db
      .select({ organizationId: guide.organizationId })
      .from(guide)
      .where(eq(guide.id, guideId))
      .limit(1)

    if (!g) {
      throw new Error('Guide not found')
    }

    const [theme] = await db
      .select()
      .from(customTheme)
      .where(and(eq(customTheme.id, themeId), eq(customTheme.organizationId, g.organizationId)))
      .limit(1)

    if (!theme) {
      throw new Error('Theme not found or does not belong to this organization')
    }
  }

  const [updatedGuide] = await db.update(guide).set({ themeId }).where(eq(guide.id, guideId)).returning()

  return updatedGuide
}

export async function duplicateTheme(themeId: string, newName: string, createdBy?: string) {
  const [original] = await db.select().from(customTheme).where(eq(customTheme.id, themeId)).limit(1)

  if (!original) {
    throw new Error('Theme not found')
  }

  return createTheme({
    organizationId: original.organizationId,
    name: newName,
    basePreset: original.basePreset,
    colors: original.colors,
    radius: Number(original.radius),
    fonts: original.fonts,
    createdBy,
  })
}
