import { and, eq, isNull, sql } from 'drizzle-orm'
import { NotFoundError } from '../../../auth/authorization'
import { db } from '../../../db'
import { tour, tourAssetDraft } from '../../schema'

// =============================================================================
// TYPES
// =============================================================================

export type AssignTourAssetInput = {
  assetId: string
  channel: string
  locale?: string | null
  position?: number
}

export type AssignTourAssetResult = {
  id: string
  assigned: boolean
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function assignTourAsset(
  tourNanoId: string,
  input: AssignTourAssetInput,
): Promise<AssignTourAssetResult> {
  const [foundTour] = await db.select({ id: tour.id }).from(tour).where(eq(tour.nanoId, tourNanoId)).limit(1)

  if (!foundTour) {
    throw new NotFoundError('Guide')
  }

  const locale = input.locale ?? null

  // Check if already assigned
  const localeCondition = locale === null ? isNull(tourAssetDraft.locale) : eq(tourAssetDraft.locale, locale)

  const [existing] = await db
    .select({ id: tourAssetDraft.id })
    .from(tourAssetDraft)
    .where(
      and(
        eq(tourAssetDraft.tourId, foundTour.id),
        eq(tourAssetDraft.assetId, input.assetId),
        eq(tourAssetDraft.channel, input.channel),
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
      .from(tourAssetDraft)
      .where(
        and(eq(tourAssetDraft.tourId, foundTour.id), eq(tourAssetDraft.channel, input.channel), localeCondition),
      )
    position = maxPos + 1
  }

  const [inserted] = await db
    .insert(tourAssetDraft)
    .values({
      tourId: foundTour.id,
      assetId: input.assetId,
      channel: input.channel,
      locale,
      position,
    })
    .returning({ id: tourAssetDraft.id })

  return { id: inserted.id, assigned: true }
}
