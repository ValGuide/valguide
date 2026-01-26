import { and, eq, isNull, sql } from 'drizzle-orm'
import { NotFoundError } from '../../../auth/authorization'
import { db } from '../../../db'
import { guide, guideAssetDraft } from '../../schema'

// =============================================================================
// TYPES
// =============================================================================

export type AssignGuideAssetInput = {
  assetId: string
  channel: string
  locale?: string | null
  position?: number
}

export type AssignGuideAssetResult = {
  id: string
  assigned: boolean
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function assignGuideAsset(
  guideNanoId: string,
  input: AssignGuideAssetInput,
): Promise<AssignGuideAssetResult> {
  const [foundGuide] = await db.select({ id: guide.id }).from(guide).where(eq(guide.nanoId, guideNanoId)).limit(1)

  if (!foundGuide) {
    throw new NotFoundError('Guide')
  }

  const locale = input.locale ?? null

  // Check if already assigned
  const localeCondition = locale === null ? isNull(guideAssetDraft.locale) : eq(guideAssetDraft.locale, locale)

  const [existing] = await db
    .select({ id: guideAssetDraft.id })
    .from(guideAssetDraft)
    .where(
      and(
        eq(guideAssetDraft.guideId, foundGuide.id),
        eq(guideAssetDraft.assetId, input.assetId),
        eq(guideAssetDraft.channel, input.channel),
        localeCondition,
      ),
    )
    .limit(1)

  if (existing) {
    return { id: existing.id, assigned: false }
  }

  // Get next position if not provided
  let position = input.position
  if (position === undefined) {
    const [{ maxPos }] = await db
      .select({ maxPos: sql<number>`COALESCE(MAX(position), -1)` })
      .from(guideAssetDraft)
      .where(
        and(eq(guideAssetDraft.guideId, foundGuide.id), eq(guideAssetDraft.channel, input.channel), localeCondition),
      )
    position = maxPos + 1
  }

  const [inserted] = await db
    .insert(guideAssetDraft)
    .values({
      guideId: foundGuide.id,
      assetId: input.assetId,
      channel: input.channel,
      locale,
      position,
    })
    .returning({ id: guideAssetDraft.id })

  return { id: inserted.id, assigned: true }
}
