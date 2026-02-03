import { and, eq } from 'drizzle-orm'
import { NotFoundError } from '../../../auth/authorization'
import { db } from '../../../db'
import { guide, guideLocale, guideLocaleDraft } from '../../schema'

export type PublishGuideLocaleResult = {
  success: boolean
}

export async function publishGuideLocale(
  guideNanoId: string,
  locale: string,
  userId: string,
): Promise<PublishGuideLocaleResult> {
  const [foundGuide] = await db.select({ id: guide.id }).from(guide).where(eq(guide.nanoId, guideNanoId)).limit(1)

  if (!foundGuide) {
    throw new NotFoundError('Guide')
  }

  const [draft] = await db
    .select({
      title: guideLocaleDraft.title,
      description: guideLocaleDraft.description,
    })
    .from(guideLocaleDraft)
    .where(and(eq(guideLocaleDraft.guideId, foundGuide.id), eq(guideLocaleDraft.locale, locale)))
    .limit(1)

  if (!draft) {
    throw new NotFoundError('Guide locale draft')
  }

  await db
    .insert(guideLocale)
    .values({
      guideId: foundGuide.id,
      locale,
      title: draft.title,
      description: draft.description,
      publishedAt: new Date(),
      publishedBy: userId,
    })
    .onConflictDoUpdate({
      target: [guideLocale.guideId, guideLocale.locale],
      set: {
        title: draft.title,
        description: draft.description,
        publishedAt: new Date(),
        publishedBy: userId,
      },
    })

  return { success: true }
}
