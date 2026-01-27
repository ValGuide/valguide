import { and, eq, isNull } from 'drizzle-orm'
import { NotFoundError } from '../../../auth/authorization'
import { db } from '../../../db'
import { stop, stopAssetDraft } from '../../schema'

// =============================================================================
// TYPES
// =============================================================================

export type RemoveStopAssetInput = {
  assetId: string
  channel: string
  locale?: string | null
}

export type RemoveStopAssetResult = {
  removed: boolean
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function removeStopAsset(stopNanoId: string, input: RemoveStopAssetInput): Promise<RemoveStopAssetResult> {
  const [foundStop] = await db.select({ id: stop.id }).from(stop).where(eq(stop.nanoId, stopNanoId)).limit(1)

  if (!foundStop) {
    throw new NotFoundError('Stop')
  }

  const locale = input.locale ?? null
  const localeCondition = locale === null ? isNull(stopAssetDraft.locale) : eq(stopAssetDraft.locale, locale)

  const result = await db
    .delete(stopAssetDraft)
    .where(
      and(
        eq(stopAssetDraft.stopId, foundStop.id),
        eq(stopAssetDraft.assetId, input.assetId),
        eq(stopAssetDraft.channel, input.channel),
        localeCondition,
      ),
    )
    .returning({ id: stopAssetDraft.id })

  return { removed: result.length > 0 }
}
