import { db } from '@valguide/core/features/db'
import { and, eq } from 'drizzle-orm'
import { valguideId } from '../../utils/nanoid'
import { guide } from '../guides/schema'
import { organization } from '../orgs/schema'
import { type NewTheme, theme as themeTable } from './schema'
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
  const [created] = await db
    .insert(themeTable)
    .values({
      nanoId: valguideId(),
      organizationId: input.organizationId,
      name: input.name,
      basePreset: input.basePreset,
      colors: input.colors,
      radius: String(input.radius),
      fonts: input.fonts,
      createdBy: input.createdBy,
    } satisfies NewTheme)
    .returning()

  return created
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
  const updates: Partial<NewTheme> = {}

  if (input.name !== undefined) updates.name = input.name
  if (input.basePreset !== undefined) updates.basePreset = input.basePreset
  if (input.colors !== undefined) updates.colors = input.colors
  if (input.radius !== undefined) updates.radius = String(input.radius)
  if (input.fonts !== undefined) updates.fonts = input.fonts

  const [updated] = await db.update(themeTable).set(updates).where(eq(themeTable.id, input.id)).returning()

  return updated
}

export async function deleteTheme(themeId: string) {
  await db.update(organization).set({ defaultThemeId: null }).where(eq(organization.defaultThemeId, themeId))

  await db.update(guide).set({ themeId: null }).where(eq(guide.themeId, themeId))

  const [deleted] = await db.delete(themeTable).where(eq(themeTable.id, themeId)).returning()

  return deleted
}

export async function setOrgDefaultTheme(organizationId: string, themeId: string | null) {
  if (themeId) {
    const [row] = await db
      .select()
      .from(themeTable)
      .where(and(eq(themeTable.id, themeId), eq(themeTable.organizationId, organizationId)))
      .limit(1)

    if (!row) {
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

    const [row] = await db
      .select()
      .from(themeTable)
      .where(and(eq(themeTable.id, themeId), eq(themeTable.organizationId, g.organizationId)))
      .limit(1)

    if (!row) {
      throw new Error('Theme not found or does not belong to this organization')
    }
  }

  const [updatedGuide] = await db.update(guide).set({ themeId }).where(eq(guide.id, guideId)).returning()

  return updatedGuide
}

export async function duplicateTheme(themeId: string, newName: string, createdBy?: string) {
  const [original] = await db.select().from(themeTable).where(eq(themeTable.id, themeId)).limit(1)

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
