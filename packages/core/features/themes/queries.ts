import { and, eq } from 'drizzle-orm'
import { db } from '../db'
import { guide } from '../guides/schema'
import { organization } from '../orgs/schema'
import { defaultFonts, defaultRadius, themeColorPresets } from './presets'
import { theme as themeTable } from './schema'
import type { ThemeConfig } from './types'

export const DEFAULT_THEME: ThemeConfig = {
  basePreset: 'light',
  colors: themeColorPresets.light,
  radius: defaultRadius,
  fonts: defaultFonts,
}

export async function getThemeById(themeId: string): Promise<ThemeConfig | null> {
  const [row] = await db.select().from(themeTable).where(eq(themeTable.id, themeId)).limit(1)

  if (!row) return null

  return {
    basePreset: row.basePreset,
    colors: row.colors,
    radius: Number(row.radius),
    fonts: row.fonts,
  }
}

export async function getFullThemeById(themeId: string) {
  const [row] = await db.select().from(themeTable).where(eq(themeTable.id, themeId)).limit(1)
  return row ?? null
}

export async function getOrgThemes(organizationId: string) {
  return db.select().from(themeTable).where(eq(themeTable.organizationId, organizationId)).orderBy(themeTable.name)
}

export async function getOrgDefaultTheme(organizationId: string): Promise<ThemeConfig | null> {
  const [org] = await db
    .select({ defaultThemeId: organization.defaultThemeId })
    .from(organization)
    .where(eq(organization.id, organizationId))
    .limit(1)

  if (!org?.defaultThemeId) return null

  return getThemeById(org.defaultThemeId)
}

export async function getGuideTheme(guideId: string): Promise<ThemeConfig | null> {
  const [g] = await db.select({ themeId: guide.themeId }).from(guide).where(eq(guide.id, guideId)).limit(1)

  if (!g?.themeId) return null

  return getThemeById(g.themeId)
}

export async function getEffectiveGuideTheme(guideId: string): Promise<ThemeConfig> {
  const [row] = await db
    .select({
      guideThemeId: guide.themeId,
      orgThemeId: organization.defaultThemeId,
      guideColors: themeTable.colors,
      guideBasePreset: themeTable.basePreset,
      guideRadius: themeTable.radius,
      guideFonts: themeTable.fonts,
    })
    .from(guide)
    .innerJoin(organization, eq(organization.id, guide.organizationId))
    .leftJoin(themeTable, eq(themeTable.id, guide.themeId))
    .where(eq(guide.id, guideId))
    .limit(1)

  if (!row) {
    return DEFAULT_THEME
  }

  if (row.guideColors && row.guideBasePreset && row.guideRadius && row.guideFonts) {
    return {
      basePreset: row.guideBasePreset,
      colors: row.guideColors,
      radius: Number(row.guideRadius),
      fonts: row.guideFonts,
    }
  }

  if (row.orgThemeId) {
    const orgTheme = await getThemeById(row.orgThemeId)
    if (orgTheme) return orgTheme
  }

  return DEFAULT_THEME
}

export async function getThemeByName(organizationId: string, name: string) {
  const [row] = await db
    .select()
    .from(themeTable)
    .where(and(eq(themeTable.organizationId, organizationId), eq(themeTable.name, name)))
    .limit(1)

  return row ?? null
}
