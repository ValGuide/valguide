import { eq } from 'drizzle-orm'
import { db } from '../db'
import type { OrgRole } from '../orgs/schema'
import { isOrgRole, organization } from '../orgs/schema'
import { getUserRole } from '../orgs/utils'
import { theme as themeTable } from './schema'

export type Theme = typeof themeTable.$inferSelect

export type BrandThemeSettings = {
  organizationId: string
  defaultThemeId: string | null
  defaultThemeName: string | null
  currentUserRole: OrgRole
  themes: Theme[]
}

export async function getBrandThemeSettings(organizationId: string, userId: string): Promise<BrandThemeSettings> {
  const [organizationRow, themes, currentUserRole] = await Promise.all([
    db.query.organization.findFirst({
      where: eq(organization.id, organizationId),
    }),
    db.select().from(themeTable).where(eq(themeTable.organizationId, organizationId)).orderBy(themeTable.name),
    getUserRole(db, organizationId, userId),
  ])

  if (!organizationRow) {
    throw new Error('Organization not found')
  }

  if (!currentUserRole || !isOrgRole(currentUserRole)) {
    throw new Error('Current user role not found')
  }

  const defaultTheme = themes.find((theme) => theme.id === organizationRow.defaultThemeId) ?? null

  return {
    organizationId,
    defaultThemeId: organizationRow.defaultThemeId,
    defaultThemeName: defaultTheme?.name ?? null,
    currentUserRole,
    themes,
  }
}
