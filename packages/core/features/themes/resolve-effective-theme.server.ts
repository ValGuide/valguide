import { and, eq } from 'drizzle-orm'
import { db } from '../db'
import { organization } from '../orgs/schema'
import { defaultThemes } from './defaults'
import { defaultFonts, defaultRadius, themeColorPresets } from './presets'
import { theme } from './schema'
import type { ThemeConfig } from './types'

export type ResolvedThemeConfig = {
  id: string
  name: string
  source: 'tour' | 'org-default' | 'default'
  config: ThemeConfig
}

type ResolveEffectiveThemeInput = {
  organizationId: string
  assignedThemeId: string | null
}

type ThemeRow = typeof theme.$inferSelect

async function getThemeById(themeId: string): Promise<ThemeRow | null> {
  const [foundTheme] = await db.select().from(theme).where(eq(theme.id, themeId)).limit(1)
  return foundTheme ?? null
}

async function getOrgDefaultTheme(organizationId: string): Promise<ThemeRow | null> {
  const [row] = await db
    .select({
      id: theme.id,
      nanoId: theme.nanoId,
      organizationId: theme.organizationId,
      name: theme.name,
      basePreset: theme.basePreset,
      colors: theme.colors,
      radius: theme.radius,
      fonts: theme.fonts,
      metadata: theme.metadata,
      createdAt: theme.createdAt,
      updatedAt: theme.updatedAt,
      createdBy: theme.createdBy,
    })
    .from(organization)
    .innerJoin(theme, eq(theme.id, organization.defaultThemeId))
    .where(eq(organization.id, organizationId))
    .limit(1)

  return row ?? null
}

function toResolvedThemeConfig(themeRow: ThemeRow, source: 'tour' | 'org-default'): ResolvedThemeConfig {
  return {
    id: themeRow.id,
    name: themeRow.name,
    source,
    config: {
      basePreset: themeRow.basePreset,
      colors: themeRow.colors,
      radius: Number(themeRow.radius),
      fonts: themeRow.fonts,
    },
  }
}

function getBuiltInDefaultTheme(): ResolvedThemeConfig {
  const basePreset = defaultThemes.light

  return {
    id: `preset:${basePreset}`,
    name: 'Default Theme',
    source: 'default',
    config: {
      basePreset,
      colors: themeColorPresets[basePreset],
      radius: defaultRadius,
      fonts: defaultFonts,
    },
  }
}

export async function resolveEffectiveTheme({
  organizationId,
  assignedThemeId,
}: ResolveEffectiveThemeInput): Promise<ResolvedThemeConfig | null> {
  if (assignedThemeId) {
    const assignedTheme = await getThemeById(assignedThemeId)
    if (assignedTheme) {
      return toResolvedThemeConfig(assignedTheme, 'tour')
    }
  }

  const orgDefaultTheme = await getOrgDefaultTheme(organizationId)
  if (!orgDefaultTheme) {
    return getBuiltInDefaultTheme()
  }

  return toResolvedThemeConfig(orgDefaultTheme, 'org-default')
}

export async function validateThemeBelongsToOrganization({
  organizationId,
  themeId,
}: {
  organizationId: string
  themeId: string
}): Promise<void> {
  const [foundTheme] = await db
    .select({ id: theme.id })
    .from(theme)
    .where(and(eq(theme.id, themeId), eq(theme.organizationId, organizationId)))
    .limit(1)

  if (!foundTheme) {
    throw new Error('Theme not found or does not belong to this organization')
  }
}
