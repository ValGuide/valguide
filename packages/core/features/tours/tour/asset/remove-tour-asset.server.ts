import { and, eq, isNull } from 'drizzle-orm'
import { NotFoundError } from '../../../auth/authorization'
import { db } from '../../../db'
import { tour, tourAssetDraft } from '../../schema'

// =============================================================================
// TYPES
// =============================================================================

export type RemoveTourAssetInput = {
  assetId: string
  channel: string
  locale?: string | null
}

export type RemoveTourAssetResult = {
  removed: boolean
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function removeTourAsset(
  tourNanoId: string,
  input: RemoveTourAssetInput,
): Promise<RemoveTourAssetResult> {
  const [foundTour] = await db.select({ id: tour.id }).from(tour).where(eq(tour.nanoId, tourNanoId)).limit(1)

  if (!foundTour) {
    throw new NotFoundError('Guide')
  }

  const locale = input.locale ?? null
  const localeCondition = locale === null ? isNull(tourAssetDraft.locale) : eq(tourAssetDraft.locale, locale)

  const result = await db
    .delete(tourAssetDraft)
    .where(
      and(
        eq(tourAssetDraft.tourId, foundTour.id),
        eq(tourAssetDraft.assetId, input.assetId),
        eq(tourAssetDraft.channel, input.channel),
        localeCondition,
      ),
    )
    .returning({ id: tourAssetDraft.id })

  return { removed: result.length > 0 }
}
