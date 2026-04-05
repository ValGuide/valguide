import { and, eq, isNull } from 'drizzle-orm'
import { asset } from '../../assets/schema'
import { db } from '../../db'
import type { ResolvedThemeConfig } from '../../themes/resolve-effective-theme.server'
import { resolveEffectiveTheme } from '../../themes/resolve-effective-theme.server'
import { tour, tourAssetDraft, tourLocale, tourLocaleDraft, tourSettings, tourSettingsDraft } from '../schema'
import { getTourHasAnyChanges } from './get-tour-has-any-changes.server'

// =============================================================================
// TYPES
// =============================================================================

export type LocaleDraftInfo = {
  locale: string
  title: string | null
  description: string | null
  hasPublished: boolean
  hasChanges: boolean
}

export type TourCoverImage = {
  storagePath: string
}

export type TourDetail = {
  id: string
  nanoId: string
  slug: string
  organizationId: string
  availableLocales: string[]
  archivedAt: Date | null
  publishedAt: Date | null
  createdAt: Date
  updatedAt: Date
  locales: LocaleDraftInfo[]
  hasAnyChanges: boolean
  settings: {
    themeId: string | null
    settingsJson: string | null
  } | null
  theme: {
    assignedThemeId: string | null
    effectiveTheme: ResolvedThemeConfig | null
    workspaceDefaultTheme: ResolvedThemeConfig | null
    publishedTheme: ResolvedThemeConfig | null
    hasChanges: boolean
  }
  coverImage: TourCoverImage | null
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function getTourDetail(nanoId: string): Promise<TourDetail | null> {
  const [foundTour] = await db
    .select()
    .from(tour)
    .where(and(eq(tour.nanoId, nanoId), isNull(tour.deletedAt)))
    .limit(1)

  if (!foundTour) return null

  const localeRows = await db
    .select({
      locale: tourLocaleDraft.locale,
      title: tourLocaleDraft.title,
      description: tourLocaleDraft.description,
      publishedLocaleId: tourLocale.id,
      publishedTitle: tourLocale.title,
      publishedDescription: tourLocale.description,
    })
    .from(tourLocaleDraft)
    .leftJoin(
      tourLocale,
      and(eq(tourLocale.tourId, tourLocaleDraft.tourId), eq(tourLocale.locale, tourLocaleDraft.locale)),
    )
    .where(eq(tourLocaleDraft.tourId, foundTour.id))

  const guideIsPublished = foundTour.publishedAt !== null
  const locales: LocaleDraftInfo[] = localeRows.map((row) => {
    const hasPublished = guideIsPublished && row.publishedLocaleId !== null
    const hasChanges = hasPublished
      ? (row.title ?? '') !== (row.publishedTitle ?? '') || (row.description ?? '') !== (row.publishedDescription ?? '')
      : false
    return {
      locale: row.locale,
      title: row.title,
      description: row.description,
      hasPublished,
      hasChanges,
    }
  })

  const [settings] = await db
    .select({
      themeId: tourSettingsDraft.themeId,
      settingsJson: tourSettingsDraft.settingsJson,
    })
    .from(tourSettingsDraft)
    .where(eq(tourSettingsDraft.tourId, foundTour.id))
    .limit(1)

  const [publishedSettings] = await db
    .select({
      themeId: tourSettings.themeId,
    })
    .from(tourSettings)
    .where(eq(tourSettings.tourId, foundTour.id))
    .limit(1)

  const [coverImageRow] = await db
    .select({
      storagePath: asset.storagePath,
    })
    .from(tourAssetDraft)
    .innerJoin(asset, eq(tourAssetDraft.assetId, asset.id))
    .where(and(eq(tourAssetDraft.tourId, foundTour.id), eq(tourAssetDraft.channel, 'images.hero')))
    .limit(1)

  const hasAnyChanges = guideIsPublished ? await getTourHasAnyChanges(foundTour.id) : false
  const effectiveTheme = await resolveEffectiveTheme({
    organizationId: foundTour.organizationId,
    assignedThemeId: settings?.themeId ?? null,
  })
  const workspaceDefaultTheme = await resolveEffectiveTheme({
    organizationId: foundTour.organizationId,
    assignedThemeId: null,
  })
  const publishedTheme = await resolveEffectiveTheme({
    organizationId: foundTour.organizationId,
    assignedThemeId: publishedSettings?.themeId ?? null,
  })
  const themeHasChanges =
    (settings?.themeId ?? null) !== (publishedSettings?.themeId ?? null) ||
    effectiveTheme?.id !== publishedTheme?.id ||
    effectiveTheme?.source !== publishedTheme?.source

  return {
    id: foundTour.id,
    nanoId: foundTour.nanoId,
    slug: foundTour.slug,
    organizationId: foundTour.organizationId,
    availableLocales: foundTour.availableLocales ?? [],
    archivedAt: foundTour.archivedAt,
    publishedAt: foundTour.publishedAt,
    createdAt: foundTour.createdAt,
    updatedAt: foundTour.updatedAt,
    locales,
    hasAnyChanges,
    settings: settings ?? null,
    theme: {
      assignedThemeId: settings?.themeId ?? null,
      effectiveTheme,
      workspaceDefaultTheme,
      publishedTheme,
      hasChanges: guideIsPublished ? themeHasChanges : false,
    },
    coverImage: coverImageRow ?? null,
  }
}
