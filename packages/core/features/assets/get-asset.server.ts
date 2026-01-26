import { eq } from 'drizzle-orm'
import { db } from '../db'
import { asset } from './schema'

// =============================================================================
// TYPES
// =============================================================================

export type Asset = typeof asset.$inferSelect

// =============================================================================
// INTERNAL FUNCTIONS
// =============================================================================

export async function getAssetByNanoId(nanoId: string): Promise<Asset | undefined> {
  return db.query.asset.findFirst({
    where: eq(asset.nanoId, nanoId),
  })
}

export async function getAssetById(id: string): Promise<Asset | undefined> {
  return db.query.asset.findFirst({
    where: eq(asset.id, id),
  })
}
