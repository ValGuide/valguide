import { eq } from 'drizzle-orm'
import { db } from '../../db'
import { guide, guideStopDraft, stop } from '../schema'

export type StopGuideUsageResult = {
  guideCount: number
  guides: Array<{
    nanoId: string
    title: string | null
  }>
}

export async function getStopGuideUsage(stopNanoId: string): Promise<StopGuideUsageResult> {
  const [stopRow] = await db.select({ id: stop.id }).from(stop).where(eq(stop.nanoId, stopNanoId)).limit(1)

  if (!stopRow) {
    return { guideCount: 0, guides: [] }
  }

  const usages = await db
    .select({
      guideNanoId: guide.nanoId,
      guideId: guide.id,
    })
    .from(guideStopDraft)
    .innerJoin(guide, eq(guideStopDraft.guideId, guide.id))
    .where(eq(guideStopDraft.stopId, stopRow.id))

  return {
    guideCount: usages.length,
    guides: usages.map((u) => ({
      nanoId: u.guideNanoId,
      title: null, // Title requires locale lookup - keep simple for now
    })),
  }
}
