import { and, eq } from 'drizzle-orm'
import { NotFoundError } from '../../../auth/authorization'
import { db } from '../../../db'
import { stop, stopLocale, stopLocaleDraft } from '../../schema'

export type PublishStopLocaleResult = {
  success: boolean
}

export async function publishStopLocale(
  stopNanoId: string,
  locale: string,
  userId: string,
): Promise<PublishStopLocaleResult> {
  const [foundStop] = await db.select({ id: stop.id }).from(stop).where(eq(stop.nanoId, stopNanoId)).limit(1)

  if (!foundStop) {
    throw new NotFoundError('Stop')
  }

  const [draft] = await db
    .select({
      title: stopLocaleDraft.title,
      description: stopLocaleDraft.description,
      transcription: stopLocaleDraft.transcription,
    })
    .from(stopLocaleDraft)
    .where(and(eq(stopLocaleDraft.stopId, foundStop.id), eq(stopLocaleDraft.locale, locale)))
    .limit(1)

  if (!draft) {
    throw new NotFoundError('Stop locale draft')
  }

  await db
    .insert(stopLocale)
    .values({
      stopId: foundStop.id,
      locale,
      title: draft.title,
      description: draft.description,
      transcription: draft.transcription,
      publishedAt: new Date(),
      publishedBy: userId,
    })
    .onConflictDoUpdate({
      target: [stopLocale.stopId, stopLocale.locale],
      set: {
        title: draft.title,
        description: draft.description,
        transcription: draft.transcription,
        publishedAt: new Date(),
        publishedBy: userId,
      },
    })

  return { success: true }
}
