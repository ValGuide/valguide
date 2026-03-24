import { and, eq, inArray } from 'drizzle-orm'
import { db } from '../db'
import {
  stop,
  stopAsset,
  stopAssetDraft,
  stopLocaleDraft,
  tour,
  tourAsset,
  tourAssetDraft,
  tourLocaleDraft,
} from '../tours/schema'
import { asset } from './schema'

export type AssetUsageScope = 'draft' | 'published' | 'draftAndPublished'

export type AssetUsageLocation = {
  id: string
  nanoId: string
  name: string
  channel: string
  locale: string | null
  scope: AssetUsageScope
}

export type AssetDeletionEligibility = {
  assetId: string
  nanoId: string
  fileName: string
  deletable: boolean
  tourCount: number
  stopCount: number
  tours: AssetUsageLocation[]
  stops: AssetUsageLocation[]
}

type UsageRow = {
  assetId: string
  id: string
  nanoId: string
  name: string | null
  channel: string
  locale: string | null
}

type UsageBucket = Map<string, AssetUsageLocation>

function mergeUsageRows(bucket: UsageBucket, rows: UsageRow[], scope: Extract<AssetUsageScope, 'draft' | 'published'>) {
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
      channel: row.channel,
      locale: row.locale,
      scope,
    })
  }
}

export async function getAssetDeletionEligibility(
  assetIds: string[],
  organizationId?: string,
): Promise<AssetDeletionEligibility[]> {
  if (assetIds.length === 0) {
    return []
  }

  const assetWhere = organizationId
    ? and(inArray(asset.id, assetIds), eq(asset.organizationId, organizationId))
    : inArray(asset.id, assetIds)

  const assetRows = await db
    .select({
      id: asset.id,
      nanoId: asset.nanoId,
      fileName: asset.fileName,
    })
    .from(asset)
    .where(assetWhere)

  if (assetRows.length === 0) {
    return []
  }

  const scopedAssetIds = assetRows.map((item) => item.id)

  const [draftTourRows, publishedTourRows, draftStopRows, publishedStopRows] = await Promise.all([
    db
      .select({
        assetId: tourAssetDraft.assetId,
        id: tour.id,
        nanoId: tour.nanoId,
        name: tourLocaleDraft.title,
        channel: tourAssetDraft.channel,
        locale: tourAssetDraft.locale,
      })
      .from(tourAssetDraft)
      .innerJoin(tour, eq(tourAssetDraft.tourId, tour.id))
      .leftJoin(tourLocaleDraft, and(eq(tourLocaleDraft.tourId, tour.id), eq(tourLocaleDraft.locale, 'en')))
      .where(inArray(tourAssetDraft.assetId, scopedAssetIds)),
    db
      .select({
        assetId: tourAsset.assetId,
        id: tour.id,
        nanoId: tour.nanoId,
        name: tourLocaleDraft.title,
        channel: tourAsset.channel,
        locale: tourAsset.locale,
      })
      .from(tourAsset)
      .innerJoin(tour, eq(tourAsset.tourId, tour.id))
      .leftJoin(tourLocaleDraft, and(eq(tourLocaleDraft.tourId, tour.id), eq(tourLocaleDraft.locale, 'en')))
      .where(inArray(tourAsset.assetId, scopedAssetIds)),
    db
      .select({
        assetId: stopAssetDraft.assetId,
        id: stop.id,
        nanoId: stop.nanoId,
        name: stopLocaleDraft.title,
        channel: stopAssetDraft.channel,
        locale: stopAssetDraft.locale,
      })
      .from(stopAssetDraft)
      .innerJoin(stop, eq(stopAssetDraft.stopId, stop.id))
      .leftJoin(stopLocaleDraft, and(eq(stopLocaleDraft.stopId, stop.id), eq(stopLocaleDraft.locale, 'en')))
      .where(inArray(stopAssetDraft.assetId, scopedAssetIds)),
    db
      .select({
        assetId: stopAsset.assetId,
        id: stop.id,
        nanoId: stop.nanoId,
        name: stopLocaleDraft.title,
        channel: stopAsset.channel,
        locale: stopAsset.locale,
      })
      .from(stopAsset)
      .innerJoin(stop, eq(stopAsset.stopId, stop.id))
      .leftJoin(stopLocaleDraft, and(eq(stopLocaleDraft.stopId, stop.id), eq(stopLocaleDraft.locale, 'en')))
      .where(inArray(stopAsset.assetId, scopedAssetIds)),
  ])

  const toursByAssetId = new Map<string, UsageBucket>()
  const stopsByAssetId = new Map<string, UsageBucket>()

  const ensureBucket = (map: Map<string, UsageBucket>, assetId: string) => {
    const existing = map.get(assetId)
    if (existing) {
      return existing
    }

    const bucket = new Map<string, AssetUsageLocation>()
    map.set(assetId, bucket)
    return bucket
  }

  for (const row of draftTourRows) {
    mergeUsageRows(ensureBucket(toursByAssetId, row.assetId), [row], 'draft')
  }

  for (const row of publishedTourRows) {
    mergeUsageRows(ensureBucket(toursByAssetId, row.assetId), [row], 'published')
  }

  for (const row of draftStopRows) {
    mergeUsageRows(ensureBucket(stopsByAssetId, row.assetId), [row], 'draft')
  }

  for (const row of publishedStopRows) {
    mergeUsageRows(ensureBucket(stopsByAssetId, row.assetId), [row], 'published')
  }

  return assetRows.map((item) => {
    const tours = Array.from(toursByAssetId.get(item.id)?.values() ?? [])
    const stops = Array.from(stopsByAssetId.get(item.id)?.values() ?? [])

    return {
      assetId: item.id,
      nanoId: item.nanoId,
      fileName: item.fileName,
      deletable: tours.length === 0 && stops.length === 0,
      tourCount: tours.length,
      stopCount: stops.length,
      tours,
      stops,
    }
  })
}
