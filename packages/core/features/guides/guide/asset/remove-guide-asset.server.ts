import { and, eq, isNull } from 'drizzle-orm'
import { NotFoundError } from '../../../auth/authorization'
import { db } from '../../../db'
import { guide, guideAssetDraft } from '../../schema'

// =============================================================================
// TYPES
// =============================================================================

export type RemoveGuideAssetInput = {
  assetId: string
  channel: string
  locale?: string | null
}

export type RemoveGuideAssetResult = {
  removed: boolean
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function removeGuideAsset(
  guideNanoId: string,
  input: RemoveGuideAssetInput,
): Promise<RemoveGuideAssetResult> {
  const [foundGuide] = await db.select({ id: guide.id }).from(guide).where(eq(guide.nanoId, guideNanoId)).limit(1)

  if (!foundGuide) {
    throw new NotFoundError('Guide')
  }

  const locale = input.locale ?? null
  const localeCondition = locale === null ? isNull(guideAssetDraft.locale) : eq(guideAssetDraft.locale, locale)

  const result = await db
    .delete(guideAssetDraft)
    .where(
      and(
        eq(guideAssetDraft.guideId, foundGuide.id),
        eq(guideAssetDraft.assetId, input.assetId),
        eq(guideAssetDraft.channel, input.channel),
        localeCondition,
      ),
    )
    .returning({ id: guideAssetDraft.id })

  return { removed: result.length > 0 }
}
