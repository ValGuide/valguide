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

type TourThemeUsageRow = {
  id: string
  nanoId: string
  draftName: string | null
  publishedName: string | null
  draftThemeId: string | null
  publishedThemeId: string | null
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

function getDraftEffectiveThemeId(row: TourThemeUsageRow, orgDefaultThemeId: string | null): string | null {
  // Draft preview falls back to published settings when the draft theme is unset.
  return row.draftThemeId ?? row.publishedThemeId ?? orgDefaultThemeId
}

function getPublishedEffectiveThemeId(row: TourThemeUsageRow, orgDefaultThemeId: string | null): string | null {
  return row.publishedThemeId ?? orgDefaultThemeId
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

  const [organizationRows, tourRows] = await Promise.all([
    db
      .select({
        id: organization.id,
        defaultThemeId: organization.defaultThemeId,
      })
      .from(organization)
      .where(eq(organization.id, themeRow.organizationId))
      .limit(1),
    db
      .select({
        id: tour.id,
        nanoId: tour.nanoId,
        draftName: tourLocaleDraft.title,
        publishedName: tourLocale.title,
        draftThemeId: tourSettingsDraft.themeId,
        publishedThemeId: tourSettings.themeId,
      })
      .from(tour)
      .leftJoin(tourSettingsDraft, eq(tourSettingsDraft.tourId, tour.id))
      .leftJoin(tourSettings, eq(tourSettings.tourId, tour.id))
      .leftJoin(tourLocaleDraft, and(eq(tourLocaleDraft.tourId, tour.id), eq(tourLocaleDraft.locale, 'en')))
      .leftJoin(tourLocale, and(eq(tourLocale.tourId, tour.id), eq(tourLocale.locale, 'en')))
      .where(eq(tour.organizationId, themeRow.organizationId)),
  ])

  const [organizationRow] = organizationRows
  const orgDefaultThemeId = organizationRow?.defaultThemeId ?? null

  const toursById = new Map<string, ThemeUsageLocation>()
  const draftTourRows: UsageRow[] = []
  const publishedTourRows: UsageRow[] = []

  for (const row of tourRows) {
    const name = row.draftName ?? row.publishedName

    if (getDraftEffectiveThemeId(row, orgDefaultThemeId) === themeId) {
      draftTourRows.push({
        id: row.id,
        nanoId: row.nanoId,
        name,
      })
    }

    if (getPublishedEffectiveThemeId(row, orgDefaultThemeId) === themeId) {
      publishedTourRows.push({
        id: row.id,
        nanoId: row.nanoId,
        name,
      })
    }
  }

  mergeThemeUsageRows(toursById, draftTourRows, 'draft')
  mergeThemeUsageRows(toursById, publishedTourRows, 'published')

  const tours = Array.from(toursById.values()).sort((a, b) => a.name.localeCompare(b.name))

  return {
    tours,
    isWorkspaceDefault: orgDefaultThemeId === themeId,
  }
}
