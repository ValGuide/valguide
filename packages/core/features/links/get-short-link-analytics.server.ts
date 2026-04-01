import { and, asc, eq, gte } from 'drizzle-orm'
import { db } from '../db'
import type { QrAnalyticsSummary } from './qr/shared'
import { short_link_daily_stats, short_links } from './schema'

function getUtcDayOffset(daysAgo: number): string {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() - daysAgo)
  return date.toISOString().slice(0, 10)
}

export async function getShortLinkAnalytics(shortLinkId: number): Promise<QrAnalyticsSummary> {
  const [shortLink] = await db
    .select({
      openCount: short_links.openCount,
      lastOpenedAt: short_links.lastOpenedAt,
    })
    .from(short_links)
    .where(eq(short_links.id, shortLinkId))
    .limit(1)

  const dailyRows = await db
    .select({
      day: short_link_daily_stats.day,
      openCount: short_link_daily_stats.openCount,
    })
    .from(short_link_daily_stats)
    .where(
      and(eq(short_link_daily_stats.shortLinkId, shortLinkId), gte(short_link_daily_stats.day, getUtcDayOffset(13))),
    )
    .orderBy(asc(short_link_daily_stats.day))

  return {
    openCount: shortLink?.openCount ?? 0,
    lastOpenedAt: shortLink?.lastOpenedAt?.toISOString() ?? null,
    dailyOpens: dailyRows.map((row) => ({
      day: row.day,
      openCount: row.openCount,
    })),
  }
}
