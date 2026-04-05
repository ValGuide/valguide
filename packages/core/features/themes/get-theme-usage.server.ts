import { and, eq } from 'drizzle-orm'
import { NotFoundError } from '../auth/authorization'
import { db } from '../db'
import { organization } from '../orgs/schema'
import { tour, tourLocale, tourLocaleDraft, tourSettings, tourSettingsDraft } from '../tours/schema'
import { theme } from './schema'

export type ThemeUsageScope = 'draft' | 'published' | 'draftAndPublished'

export type ThemeUsageLocation = {
  id: string
  nanoId: string
  name: string
  scope: ThemeUsageScope
}

export type ThemeUsageDetails = {
  tours: ThemeUsageLocation[]
  isWorkspaceDefault: boolean
}

type UsageRow = {
  id: string
  nanoId: string
  name: string | null
}

function mergeThemeUsageRows(
  bucket: Map<string, ThemeUsageLocation>,
  rows: UsageRow[],
  scope: Extract<ThemeUsageScope, 'draft' | 'published'>,
) {
  for (const row of rows) {
    const existing = bucket.get(row.id)

    if (existing) {
      bucket.set(row.id, {
        ...existing,
        scope: existing.scope === scope ? existing.scope : 'draftAndPublished',
      })
      continue
    }

    bucket.set(row.id, {
      id: row.id,
      nanoId: row.nanoId,
      name: row.name ?? 'Untitled',
      scope,
    })
  }
}

export async function getThemeUsage(themeId: string): Promise<ThemeUsageDetails> {
  const [themeRow] = await db
    .select({
      id: theme.id,
      organizationId: theme.organizationId,
    })
    .from(theme)
    .where(eq(theme.id, themeId))
    .limit(1)

  if (!themeRow) {
    throw new NotFoundError('Theme')
  }

  const [draftTourRows, publishedTourRows, orgDefaultRow] = await Promise.all([
    db
      .select({
        id: tour.id,
        nanoId: tour.nanoId,
        name: tourLocaleDraft.title,
      })
      .from(tourSettingsDraft)
      .innerJoin(tour, eq(tourSettingsDraft.tourId, tour.id))
      .leftJoin(tourLocaleDraft, and(eq(tourLocaleDraft.tourId, tour.id), eq(tourLocaleDraft.locale, 'en')))
      .where(eq(tourSettingsDraft.themeId, themeId)),
    db
      .select({
        id: tour.id,
        nanoId: tour.nanoId,
        name: tourLocale.title,
      })
      .from(tourSettings)
      .innerJoin(tour, eq(tourSettings.tourId, tour.id))
      .leftJoin(tourLocale, and(eq(tourLocale.tourId, tour.id), eq(tourLocale.locale, 'en')))
      .where(eq(tourSettings.themeId, themeId)),
    db
      .select({ id: organization.id })
      .from(organization)
      .where(and(eq(organization.id, themeRow.organizationId), eq(organization.defaultThemeId, themeId)))
      .limit(1),
  ])

  const toursById = new Map<string, ThemeUsageLocation>()

  mergeThemeUsageRows(toursById, draftTourRows, 'draft')
  mergeThemeUsageRows(toursById, publishedTourRows, 'published')

  const tours = Array.from(toursById.values()).sort((a, b) => a.name.localeCompare(b.name))

  return {
    tours,
    isWorkspaceDefault: Boolean(orgDefaultRow),
  }
}
