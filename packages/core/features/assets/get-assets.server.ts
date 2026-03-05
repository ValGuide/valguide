import { and, asc, countDistinct, desc, eq, getTableColumns, gt, ilike, lt, or, sql } from 'drizzle-orm'
import { db } from '../db'
import { stopAsset, tourAsset } from '../tours/schema'
import { type AssetType, asset } from './schema'

// =============================================================================
// TYPES
// =============================================================================

export type GetAssetsFilters = {
  type?: AssetType
  organizationId?: string
  uploadedBy?: string
  search?: string
}

export type AssetSortBy = 'createdAt' | 'name'
export type AssetSortDirection = 'asc' | 'desc'

export type AssetWithUsage = typeof asset.$inferSelect & {
  tourCount: number
  stopCount: number
}

type AssetCursorPayload = {
  sortBy: AssetSortBy
  sortDirection: AssetSortDirection
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
    const isValidSortBy = parsed.sortBy === 'createdAt' || parsed.sortBy === 'name'
    const isValidSortDirection = parsed.sortDirection === 'asc' || parsed.sortDirection === 'desc'
    if (!parsed.sortValue || !parsed.id || !isValidSortBy || !isValidSortDirection) {
      throw new Error('Invalid cursor')
    }
    const sortBy = parsed.sortBy as AssetSortBy
    const sortDirection = parsed.sortDirection as AssetSortDirection
    return {
      sortBy,
      sortDirection,
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

  return sortDirection === 'asc'
    ? query.orderBy(asc(asset.createdAt), asc(asset.id))
    : query.orderBy(desc(asset.createdAt), desc(asset.id))
}

function getCursorSortValue(assetItem: AssetWithUsage, sortBy: AssetSortBy): string {
  if (sortBy === 'name') {
    return assetItem.fileName
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

  const cursorDate = new Date(decodedCursor.sortValue)
  return sortDirection === 'asc'
    ? or(gt(asset.createdAt, cursorDate), and(eq(asset.createdAt, cursorDate), gt(asset.id, decodedCursor.id)))
    : or(lt(asset.createdAt, cursorDate), and(eq(asset.createdAt, cursorDate), lt(asset.id, decodedCursor.id)))
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function getAssets(filters?: GetAssetsFilters): Promise<AssetWithUsage[]> {
  const conditions = getFilterConditions(filters)
  const query = buildAssetSelectQuery(DEFAULT_SORT_BY, DEFAULT_SORT_DIRECTION)
  if (conditions.length === 0) {
    return query
  }
  return query.where(and(...conditions))
}

export async function getAssetsPage(filters?: GetAssetsPageFilters): Promise<AssetPage> {
  const pageSize = Math.min(filters?.limit ?? DEFAULT_ASSETS_PAGE_SIZE, MAX_ASSETS_PAGE_SIZE)
  const { sortBy, sortDirection } = resolveSort(filters)
  const query = buildAssetSelectQuery(sortBy, sortDirection)
  const conditions = getFilterConditions(filters)

  if (!filters?.cursor) {
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
              sortValue: getCursorSortValue(lastItem, sortBy),
              id: lastItem.id,
            })
          : null,
    }
  }

  const decodedCursor = decodeCursor(filters.cursor)
  if (decodedCursor.sortBy !== sortBy || decodedCursor.sortDirection !== sortDirection) {
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
            sortValue: getCursorSortValue(lastItem, sortBy),
            id: lastItem.id,
          })
        : null,
  }
}
