import { and, countDistinct, desc, eq, getTableColumns, ilike, lt, or, sql } from 'drizzle-orm'
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

export type AssetWithUsage = typeof asset.$inferSelect & {
  tourCount: number
  stopCount: number
}

type AssetCursorPayload = {
  createdAt: string
  id: string
}

export type GetAssetsPageFilters = GetAssetsFilters & {
  cursor?: string
  limit?: number
}

export type AssetPage = {
  items: AssetWithUsage[]
  nextCursor: string | null
  hasMore: boolean
}

const DEFAULT_ASSETS_PAGE_SIZE = 60
const MAX_ASSETS_PAGE_SIZE = 120

function encodeCursor(payload: AssetCursorPayload): string {
  return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url')
}

function decodeCursor(cursor: string): AssetCursorPayload {
  try {
    const parsed = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8')) as Partial<AssetCursorPayload>
    if (!parsed.createdAt || !parsed.id) {
      throw new Error('Invalid cursor')
    }
    return {
      createdAt: parsed.createdAt,
      id: parsed.id,
    }
  } catch {
    throw new Error('Invalid cursor')
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

function buildAssetSelectQuery() {
  const tourCountSq = db
    .select({ count: countDistinct(tourAsset.tourId) })
    .from(tourAsset)
    .where(eq(tourAsset.assetId, asset.id))

  const stopCountSq = db
    .select({ count: countDistinct(stopAsset.stopId) })
    .from(stopAsset)
    .where(eq(stopAsset.assetId, asset.id))

  return db
    .select({
      ...getTableColumns(asset),
      tourCount: sql<number>`COALESCE(${tourCountSq}, 0)`.as('tour_count'),
      stopCount: sql<number>`COALESCE(${stopCountSq}, 0)`.as('stop_count'),
    })
    .from(asset)
    .orderBy(desc(asset.createdAt), desc(asset.id))
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function getAssets(filters?: GetAssetsFilters): Promise<AssetWithUsage[]> {
  const conditions = getFilterConditions(filters)
  const query = buildAssetSelectQuery()
  if (conditions.length === 0) {
    return query
  }
  return query.where(and(...conditions))
}

export async function getAssetsPage(filters?: GetAssetsPageFilters): Promise<AssetPage> {
  const pageSize = Math.min(filters?.limit ?? DEFAULT_ASSETS_PAGE_SIZE, MAX_ASSETS_PAGE_SIZE)
  const query = buildAssetSelectQuery()
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
              createdAt: new Date(lastItem.createdAt).toISOString(),
              id: lastItem.id,
            })
          : null,
    }
  }

  const decodedCursor = decodeCursor(filters.cursor)
  const cursorDate = new Date(decodedCursor.createdAt)
  const cursorCondition = or(
    lt(asset.createdAt, cursorDate),
    and(eq(asset.createdAt, cursorDate), lt(asset.id, decodedCursor.id)),
  )
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
            createdAt: new Date(lastItem.createdAt).toISOString(),
            id: lastItem.id,
          })
        : null,
  }
}
