import {
  and,
  asc,
  countDistinct,
  desc,
  eq,
  exists,
  getTableColumns,
  gt,
  ilike,
  lt,
  notExists,
  or,
  sql,
} from 'drizzle-orm'
import { db } from '../db'
import { stopAsset, tourAsset } from '../tours/schema'
import { type AssetType, asset } from './schema'

// =============================================================================
// TYPES
// =============================================================================

export type GetAssetsFilters = {
  type?: AssetType
  usage?: AssetUsageFilter
  organizationId?: string
  uploadedBy?: string
  search?: string
}

export type AssetUsageFilter = 'used' | 'unused'
export type AssetSortBy = 'createdAt' | 'name' | 'usage'
export type AssetSortDirection = 'asc' | 'desc'

export type AssetWithUsage = typeof asset.$inferSelect & {
  tourCount: number
  stopCount: number
}

type AssetCursorPayload = {
  sortBy: AssetSortBy
  sortDirection: AssetSortDirection
  type: AssetType | null
  usage: AssetUsageFilter | null
  search: string | null
  sortValue: string
  id: string
}

export type GetAssetsPageFilters = GetAssetsFilters & {
  cursor?: string
  limit?: number
  sortBy?: AssetSortBy
  sortDirection?: AssetSortDirection
}

export type AssetPage = {
  items: AssetWithUsage[]
  nextCursor: string | null
  hasMore: boolean
}

const DEFAULT_ASSETS_PAGE_SIZE = 60
const MAX_ASSETS_PAGE_SIZE = 120

const DEFAULT_SORT_BY: AssetSortBy = 'createdAt'
const DEFAULT_SORT_DIRECTION: AssetSortDirection = 'desc'

function encodeCursor(payload: AssetCursorPayload): string {
  return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url')
}

function decodeCursor(cursor: string): AssetCursorPayload {
  try {
    const parsed = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8')) as Partial<AssetCursorPayload>
    const isValidSortBy = parsed.sortBy === 'createdAt' || parsed.sortBy === 'name' || parsed.sortBy === 'usage'
    const isValidSortDirection = parsed.sortDirection === 'asc' || parsed.sortDirection === 'desc'
    const isValidType =
      parsed.type === null || parsed.type === 'image' || parsed.type === 'audio' || parsed.type === 'video'
    const isValidUsage = parsed.usage === null || parsed.usage === 'used' || parsed.usage === 'unused'
    const isValidSearch = parsed.search === null || typeof parsed.search === 'string'
    if (
      !parsed.sortValue ||
      !parsed.id ||
      !isValidSortBy ||
      !isValidSortDirection ||
      !isValidType ||
      !isValidUsage ||
      !isValidSearch
    ) {
      throw new Error('Invalid cursor')
    }
    const sortBy = parsed.sortBy as AssetSortBy
    const sortDirection = parsed.sortDirection as AssetSortDirection
    const type = parsed.type as AssetType | null
    const usage = parsed.usage as AssetUsageFilter | null
    const search = parsed.search as string | null
    return {
      sortBy,
      sortDirection,
      type,
      usage,
      search,
      sortValue: parsed.sortValue,
      id: parsed.id,
    }
  } catch {
    throw new Error('Invalid cursor')
  }
}

function resolveSort(filters?: GetAssetsPageFilters): { sortBy: AssetSortBy; sortDirection: AssetSortDirection } {
  return {
    sortBy: filters?.sortBy ?? DEFAULT_SORT_BY,
    sortDirection: filters?.sortDirection ?? DEFAULT_SORT_DIRECTION,
  }
}

function getFilterConditions(filters?: GetAssetsFilters) {
  const conditions = []

  if (filters?.type) {
    conditions.push(eq(asset.type, filters.type))
  }
  if (filters?.organizationId) {
    conditions.push(eq(asset.organizationId, filters.organizationId))
  }
  if (filters?.uploadedBy) {
    conditions.push(eq(asset.uploadedBy, filters.uploadedBy))
  }
  const search = filters?.search?.trim()
  if (search) {
    conditions.push(ilike(asset.fileName, `%${search}%`))
  }

  return conditions
}

function normalizeSearch(search?: string): string | undefined {
  const trimmed = search?.trim()
  return trimmed && trimmed.length > 0 ? trimmed : undefined
}

function getUsageCondition(usage?: AssetUsageFilter) {
  if (!usage) {
    return undefined
  }

  const hasTourUsage = exists(
    db.select({ assetId: tourAsset.assetId }).from(tourAsset).where(eq(tourAsset.assetId, asset.id)),
  )
  const hasStopUsage = exists(
    db.select({ assetId: stopAsset.assetId }).from(stopAsset).where(eq(stopAsset.assetId, asset.id)),
  )

  if (usage === 'used') {
    return or(hasTourUsage, hasStopUsage)
  }

  const noTourUsage = notExists(
    db.select({ assetId: tourAsset.assetId }).from(tourAsset).where(eq(tourAsset.assetId, asset.id)),
  )
  const noStopUsage = notExists(
    db.select({ assetId: stopAsset.assetId }).from(stopAsset).where(eq(stopAsset.assetId, asset.id)),
  )
  return and(noTourUsage, noStopUsage)
}

function getUsageSortExpression() {
  const tourCountSq = db
    .select({ count: countDistinct(tourAsset.tourId) })
    .from(tourAsset)
    .where(eq(tourAsset.assetId, asset.id))

  const stopCountSq = db
    .select({ count: countDistinct(stopAsset.stopId) })
    .from(stopAsset)
    .where(eq(stopAsset.assetId, asset.id))

  return sql<number>`COALESCE(${tourCountSq}, 0) + COALESCE(${stopCountSq}, 0)`
}

function buildAssetSelectQuery(sortBy: AssetSortBy, sortDirection: AssetSortDirection) {
  const tourCountSq = db
    .select({ count: countDistinct(tourAsset.tourId) })
    .from(tourAsset)
    .where(eq(tourAsset.assetId, asset.id))

  const stopCountSq = db
    .select({ count: countDistinct(stopAsset.stopId) })
    .from(stopAsset)
    .where(eq(stopAsset.assetId, asset.id))

  const query = db
    .select({
      ...getTableColumns(asset),
      tourCount: sql<number>`COALESCE(${tourCountSq}, 0)`.as('tour_count'),
      stopCount: sql<number>`COALESCE(${stopCountSq}, 0)`.as('stop_count'),
    })
    .from(asset)

  if (sortBy === 'name') {
    return sortDirection === 'asc'
      ? query.orderBy(asc(asset.fileName), asc(asset.id))
      : query.orderBy(desc(asset.fileName), desc(asset.id))
  }

  if (sortBy === 'usage') {
    const usageSortExpression = getUsageSortExpression()
    return sortDirection === 'asc'
      ? query.orderBy(asc(usageSortExpression), asc(asset.id))
      : query.orderBy(desc(usageSortExpression), desc(asset.id))
  }

  return sortDirection === 'asc'
    ? query.orderBy(asc(asset.createdAt), asc(asset.id))
    : query.orderBy(desc(asset.createdAt), desc(asset.id))
}

function getCursorSortValue(assetItem: AssetWithUsage, sortBy: AssetSortBy): string {
  if (sortBy === 'name') {
    return assetItem.fileName
  }
  if (sortBy === 'usage') {
    return String(assetItem.tourCount + assetItem.stopCount)
  }
  return new Date(assetItem.createdAt).toISOString()
}

function buildCursorCondition(
  sortBy: AssetSortBy,
  sortDirection: AssetSortDirection,
  decodedCursor: AssetCursorPayload,
) {
  if (sortBy === 'name') {
    return sortDirection === 'asc'
      ? or(
          gt(asset.fileName, decodedCursor.sortValue),
          and(eq(asset.fileName, decodedCursor.sortValue), gt(asset.id, decodedCursor.id)),
        )
      : or(
          lt(asset.fileName, decodedCursor.sortValue),
          and(eq(asset.fileName, decodedCursor.sortValue), lt(asset.id, decodedCursor.id)),
        )
  }

  if (sortBy === 'usage') {
    const usageSortExpression = getUsageSortExpression()
    const usageCount = Number(decodedCursor.sortValue)
    if (Number.isNaN(usageCount)) {
      throw new Error('Invalid cursor')
    }
    return sortDirection === 'asc'
      ? or(
          gt(usageSortExpression, usageCount),
          and(eq(usageSortExpression, usageCount), gt(asset.id, decodedCursor.id)),
        )
      : or(
          lt(usageSortExpression, usageCount),
          and(eq(usageSortExpression, usageCount), lt(asset.id, decodedCursor.id)),
        )
  }

  const cursorDate = new Date(decodedCursor.sortValue)
  return sortDirection === 'asc'
    ? or(gt(asset.createdAt, cursorDate), and(eq(asset.createdAt, cursorDate), gt(asset.id, decodedCursor.id)))
    : or(lt(asset.createdAt, cursorDate), and(eq(asset.createdAt, cursorDate), lt(asset.id, decodedCursor.id)))
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function getAssets(filters?: GetAssetsFilters): Promise<AssetWithUsage[]> {
  const normalizedFilters: GetAssetsFilters = {
    ...filters,
    search: normalizeSearch(filters?.search),
  }
  const conditions = getFilterConditions(normalizedFilters)
  const usageCondition = getUsageCondition(normalizedFilters.usage)
  if (usageCondition) {
    conditions.push(usageCondition)
  }
  const query = buildAssetSelectQuery(DEFAULT_SORT_BY, DEFAULT_SORT_DIRECTION)
  if (conditions.length === 0) {
    return query
  }
  return query.where(and(...conditions))
}

export async function getAssetsPage(filters?: GetAssetsPageFilters): Promise<AssetPage> {
  const normalizedSearch = normalizeSearch(filters?.search)
  const normalizedType = filters?.type ?? null
  const normalizedUsage = filters?.usage ?? null
  const normalizedFilters: GetAssetsPageFilters = {
    ...filters,
    search: normalizedSearch,
  }
  const pageSize = Math.min(filters?.limit ?? DEFAULT_ASSETS_PAGE_SIZE, MAX_ASSETS_PAGE_SIZE)
  const { sortBy, sortDirection } = resolveSort(normalizedFilters)
  const query = buildAssetSelectQuery(sortBy, sortDirection)
  const conditions = getFilterConditions(normalizedFilters)
  const usageCondition = getUsageCondition(normalizedFilters.usage)
  if (usageCondition) {
    conditions.push(usageCondition)
  }

  if (!normalizedFilters.cursor) {
    const rows = await (conditions.length === 0 ? query : query.where(and(...conditions))).limit(pageSize + 1)
    const hasMore = rows.length > pageSize
    const items = hasMore ? rows.slice(0, pageSize) : rows
    const lastItem = items[items.length - 1]

    return {
      items,
      hasMore,
      nextCursor:
        hasMore && lastItem
          ? encodeCursor({
              sortBy,
              sortDirection,
              type: normalizedType,
              usage: normalizedUsage,
              search: normalizedSearch ?? null,
              sortValue: getCursorSortValue(lastItem, sortBy),
              id: lastItem.id,
            })
          : null,
    }
  }

  const decodedCursor = decodeCursor(normalizedFilters.cursor)
  if (
    decodedCursor.sortBy !== sortBy ||
    decodedCursor.sortDirection !== sortDirection ||
    decodedCursor.type !== normalizedType ||
    decodedCursor.usage !== normalizedUsage ||
    decodedCursor.search !== (normalizedSearch ?? null)
  ) {
    throw new Error('Invalid cursor')
  }
  const cursorCondition = buildCursorCondition(sortBy, sortDirection, decodedCursor)
  const allConditions = [...conditions, cursorCondition]

  const rows = await query.where(and(...allConditions)).limit(pageSize + 1)

  const hasMore = rows.length > pageSize
  const items = hasMore ? rows.slice(0, pageSize) : rows
  const lastItem = items[items.length - 1]

  return {
    items,
    hasMore,
    nextCursor:
      hasMore && lastItem
        ? encodeCursor({
            sortBy,
            sortDirection,
            type: normalizedType,
            usage: normalizedUsage,
            search: normalizedSearch ?? null,
            sortValue: getCursorSortValue(lastItem, sortBy),
            id: lastItem.id,
          })
        : null,
  }
}
