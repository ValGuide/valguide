import { and, eq, isNull } from 'drizzle-orm'
import { asset } from '../../assets/schema'
import { db } from '../../db'
import { tour, tourAssetDraft, tourLocale, tourLocaleDraft, tourSettingsDraft } from '../schema'

// =============================================================================
// TYPES
// =============================================================================

export type LocaleDraftInfo = {
  locale: string
  title: string | null
  description: string | null
  hasPublished: boolean
}

export type TourCoverImage = {
  storagePath: string
  publicUrl: string | null
}

export type TourDetail = {
  id: string
  nanoId: string
  organizationId: string
  availableLocales: string[]
  archivedAt: Date | null
  createdAt: Date
  updatedAt: Date
  locales: LocaleDraftInfo[]
  settings: {
    themeId: string | null
    settingsJson: string | null
  } | null
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
    })
    .from(tourLocaleDraft)
    .leftJoin(
      tourLocale,
      and(eq(tourLocale.tourId, tourLocaleDraft.tourId), eq(tourLocale.locale, tourLocaleDraft.locale)),
    )
    .where(eq(tourLocaleDraft.tourId, foundTour.id))

  const locales: LocaleDraftInfo[] = localeRows.map((row) => ({
    locale: row.locale,
    title: row.title,
    description: row.description,
    hasPublished: row.publishedLocaleId !== null,
  }))

  const [settings] = await db
    .select({
      themeId: tourSettingsDraft.themeId,
      settingsJson: tourSettingsDraft.settingsJson,
    })
    .from(tourSettingsDraft)
    .where(eq(tourSettingsDraft.tourId, foundTour.id))
    .limit(1)

  const [coverImageRow] = await db
    .select({
      storagePath: asset.storagePath,
      publicUrl: asset.publicUrl,
    })
    .from(tourAssetDraft)
    .innerJoin(asset, eq(tourAssetDraft.assetId, asset.id))
    .where(and(eq(tourAssetDraft.tourId, foundTour.id), eq(tourAssetDraft.channel, 'images.hero')))
    .limit(1)

  return {
    id: foundTour.id,
    nanoId: foundTour.nanoId,
    organizationId: foundTour.organizationId,
    availableLocales: foundTour.availableLocales ?? [],
    archivedAt: foundTour.archivedAt,
    createdAt: foundTour.createdAt,
    updatedAt: foundTour.updatedAt,
    locales,
    settings: settings ?? null,
    coverImage: coverImageRow ?? null,
  }
}
