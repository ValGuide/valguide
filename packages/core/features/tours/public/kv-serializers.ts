/**
 * Serializers for converting between Postgres types and KV JSON shapes.
 *
 * serializeTourForKv         — TourWithStopsAndAssets → TourKvData (extract single locale)
 * serializeTourSharedForKv   — TourWithStopsAndAssets → TourSharedKvData
 * tourKvDataToTourWithStops  — KV blobs → TourWithStopsAndAssets
 */

import type { TourKvData, TourSharedKvData } from './kv-types'
import type { AssetItem, TourWithStopsAndAssets } from './types'

export function serializeTourForKv(tour: TourWithStopsAndAssets, locale: string): TourKvData {
  const translation = tour.translations.find((t) => t.locale === locale)

  return {
    nanoId: tour.nanoId,
    locale,
    title: translation?.title ?? null,
    description: translation?.description ?? null,
    availableLocales: tour.availableLocales,
    stops: tour.stops.map((stop, index) => {
      const stopTranslation = stop.translations.find((t) => t.locale === locale)
      return {
        nanoId: stop.nanoId,
        position: index,
        title: stopTranslation?.title ?? null,
        description: stopTranslation?.description ?? null,
        transcription: stopTranslation?.transcription ?? null,
        assets: stop.assets,
      }
    }),
    assets: tour.assets,
    publishedAt: new Date().toISOString(),
  }
}

export function serializeTourSharedForKv(tour: TourWithStopsAndAssets): TourSharedKvData {
  return {
    nanoId: tour.nanoId,
    theme: tour.theme,
    publishedAt: new Date().toISOString(),
  }
}

export function tourKvDataToTourWithStops(
  kvData: TourKvData,
  sharedData: TourSharedKvData | null = null,
): TourWithStopsAndAssets {
  const publishedAt = new Date(kvData.publishedAt)

  return {
    id: '',
    nanoId: kvData.nanoId,
    organizationId: '',
    createdAt: publishedAt,
    updatedAt: publishedAt,
    availableLocales: kvData.availableLocales,
    translations: [
      {
        locale: kvData.locale,
        title: kvData.title,
        description: kvData.description,
      },
    ],
    assets: reviveAssetDates(kvData.assets),
    stops: kvData.stops.map((stop) => ({
      id: '',
      nanoId: stop.nanoId,
      organizationId: '',
      createdAt: publishedAt,
      updatedAt: publishedAt,
      availableLocales: kvData.availableLocales,
      translations: [
        {
          locale: kvData.locale,
          title: stop.title,
          description: stop.description,
          transcription: stop.transcription,
        },
      ],
      assets: reviveAssetDates(stop.assets),
    })),
    theme: sharedData?.theme ?? kvData.theme ?? null,
  }
}

/**
 * After JSON round-trip, Date fields in AssetItem become ISO strings.
 * This revives them back to Date objects.
 */
function reviveAssetDates(assets: AssetItem[]): AssetItem[] {
  return assets.map((a) => ({
    ...a,
    createdAt: new Date(a.createdAt as never),
    updatedAt: new Date(a.updatedAt as never),
  }))
}
