import { and, eq } from 'drizzle-orm'
import { NotFoundError } from '../../../auth/authorization'
import { db } from '../../../db'
import { guide, guideLocale } from '../../schema'

export type UnpublishGuideLocaleResult = {
  success: boolean
}

export async function unpublishGuideLocale(guideNanoId: string, locale: string): Promise<UnpublishGuideLocaleResult> {
  const [foundGuide] = await db.select({ id: guide.id }).from(guide).where(eq(guide.nanoId, guideNanoId)).limit(1)

  if (!foundGuide) {
    throw new NotFoundError('Guide')
  }

  const result = await db
    .delete(guideLocale)
    .where(and(eq(guideLocale.guideId, foundGuide.id), eq(guideLocale.locale, locale)))
    .returning({ id: guideLocale.id })

  if (result.length === 0) {
    throw new NotFoundError('Guide locale')
  }

  return { success: true }
}
