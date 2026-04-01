import { and, eq, sql } from 'drizzle-orm'
import { db } from '../db'
import { short_link_daily_stats, short_links } from './schema'

function getUtcDay(value: Date): string {
  return value.toISOString().slice(0, 10)
}

export async function trackShortLinkOpen(shortLinkId: number): Promise<void> {
  const openedAt = new Date()
  const day = getUtcDay(openedAt)

  await db.transaction(async (tx) => {
    await tx
      .update(short_links)
      .set({
        openCount: sql`${short_links.openCount} + 1`,
        lastOpenedAt: openedAt,
      })
      .where(eq(short_links.id, shortLinkId))

    const existing = await tx.query.short_link_daily_stats.findFirst({
      where: and(eq(short_link_daily_stats.shortLinkId, shortLinkId), eq(short_link_daily_stats.day, day)),
    })

    if (existing) {
      await tx
        .update(short_link_daily_stats)
        .set({
          openCount: sql`${short_link_daily_stats.openCount} + 1`,
          updatedAt: openedAt,
        })
        .where(eq(short_link_daily_stats.id, existing.id))
      return
    }

    await tx.insert(short_link_daily_stats).values({
      shortLinkId,
      day,
      openCount: 1,
    })
  })
}
