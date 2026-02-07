import { and, eq, isNotNull, isNull } from 'drizzle-orm'
import { tourSlug } from '../../schema'

type Tx = Parameters<Parameters<import('../../../db').DB['transaction']>[0]>[0]

export async function publishTourSlugTx(tx: Tx, tourId: string): Promise<void> {
  const draftSlug = await tx.query.tourSlug.findFirst({
    where: and(eq(tourSlug.tourId, tourId), isNull(tourSlug.publishedAt)),
    columns: { id: true, slug: true },
  })

  if (!draftSlug) {
    return
  }

  const existingPublishedWithSameSlug = await tx.query.tourSlug.findFirst({
    where: and(eq(tourSlug.tourId, tourId), eq(tourSlug.slug, draftSlug.slug), isNotNull(tourSlug.publishedAt)),
    columns: { id: true },
  })

  if (existingPublishedWithSameSlug) {
    await tx
      .update(tourSlug)
      .set({ isPrimary: false })
      .where(and(eq(tourSlug.tourId, tourId), isNotNull(tourSlug.publishedAt)))

    await tx.update(tourSlug).set({ isPrimary: true }).where(eq(tourSlug.id, existingPublishedWithSameSlug.id))

    await tx.delete(tourSlug).where(eq(tourSlug.id, draftSlug.id))
  } else {
    await tx
      .update(tourSlug)
      .set({ isPrimary: false })
      .where(and(eq(tourSlug.tourId, tourId), isNotNull(tourSlug.publishedAt)))

    await tx.update(tourSlug).set({ publishedAt: new Date(), isPrimary: true }).where(eq(tourSlug.id, draftSlug.id))
  }
}
