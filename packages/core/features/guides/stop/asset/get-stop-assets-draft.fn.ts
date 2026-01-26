import { createServerFn } from '@tanstack/react-start'
import { asc, eq } from 'drizzle-orm'
import { z } from 'zod'
import { NotFoundError, requireStopAccessByNanoId } from '../../../auth/authorization'
import { requireAuthMiddleware } from '../../../auth/middleware'
import { db } from '../../../db'
import { stop, stopAssetDraft } from '../../schema'

// =============================================================================
// TYPES
// =============================================================================

export type StopAssetDraftItem = {
  id: string
  assetId: string
  channel: string
  locale: string | null
  position: number
  createdAt: Date
}

export type GetStopAssetsDraftResult = {
  assets: StopAssetDraftItem[]
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function getStopAssetsDraft(
  stopNanoId: string,
  channel?: string,
  locale?: string | null,
): Promise<GetStopAssetsDraftResult> {
  const [foundStop] = await db.select({ id: stop.id }).from(stop).where(eq(stop.nanoId, stopNanoId)).limit(1)

  if (!foundStop) {
    throw new NotFoundError('Stop')
  }

  const assets = await db
    .select({
      id: stopAssetDraft.id,
      assetId: stopAssetDraft.assetId,
      channel: stopAssetDraft.channel,
      locale: stopAssetDraft.locale,
      position: stopAssetDraft.position,
      createdAt: stopAssetDraft.createdAt,
    })
    .from(stopAssetDraft)
    .where(eq(stopAssetDraft.stopId, foundStop.id))
    .orderBy(asc(stopAssetDraft.position))

  // Filter by channel and locale if provided
  const filtered = assets.filter((a) => {
    if (channel && a.channel !== channel) return false
    if (locale !== undefined && a.locale !== locale) return false
    return true
  })

  return { assets: filtered }
}

// =============================================================================
// SERVER FUNCTION
// =============================================================================

const getStopAssetsDraftSchema = z.object({
  nanoId: z.string(),
  channel: z.string().optional(),
  locale: z.string().nullable().optional(),
})

export const getStopAssetsDraftFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getStopAssetsDraftSchema)
  .handler(async ({ context, data }) => {
    await requireStopAccessByNanoId(data.nanoId, context.user.id)

    return getStopAssetsDraft(data.nanoId, data.channel, data.locale)
  })
