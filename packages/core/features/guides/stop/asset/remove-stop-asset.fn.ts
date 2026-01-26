import { createServerFn } from '@tanstack/react-start'
import { and, eq, isNull } from 'drizzle-orm'
import { z } from 'zod'
import { NotFoundError, requireStopAccessByNanoId } from '../../../auth/authorization'
import { requireAuthMiddleware } from '../../../auth/middleware'
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

// =============================================================================
// SERVER FUNCTION
// =============================================================================

const removeStopAssetSchema = z.object({
  nanoId: z.string(),
  assetId: z.string(),
  channel: z.string(),
  locale: z.string().nullable().optional(),
})

export const removeStopAssetFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(removeStopAssetSchema)
  .handler(async ({ context, data }) => {
    await requireStopAccessByNanoId(data.nanoId, context.user.id)

    return removeStopAsset(data.nanoId, {
      assetId: data.assetId,
      channel: data.channel,
      locale: data.locale,
    })
  })
