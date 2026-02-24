/**
 * KV read/write helpers for tour data edge caching.
 *
 * Key patterns:
 *   tour:{nanoId}:{locale}           → TourKvData
 *   org-slug:{slug}                  → OrgSlugKvEntry
 *   tour-slug:{orgSlug}:{tourSlug}   → TourSlugKvEntry
 *
 * All helpers return null / no-op gracefully when KV is unavailable
 * (e.g. local dev without Cloudflare bindings).
 */

import { env } from 'cloudflare:workers'
import type { OrgSlugKvEntry, TourKvData, TourSlugKvEntry } from './kv-types'

function getKv(): KVNamespace | null {
  try {
    return env.TOUR_DATA ?? null
  } catch {
    return null
  }
}

// ── Key builders ─────────────────────────────────────────────────

function tourDataKey(nanoId: string, locale: string): string {
  return `tour:${nanoId}:${locale}`
}

function orgSlugKey(slug: string): string {
  return `org-slug:${slug}`
}

function tourSlugKey(orgSlug: string, tourSlug: string): string {
  return `tour-slug:${orgSlug}:${tourSlug}`
}

// ── Read helpers ─────────────────────────────────────────────────

export async function readTourFromKv(tourNanoId: string, locale: string): Promise<TourKvData | null> {
  const kv = getKv()
  if (!kv) return null
  try {
    const data = await kv.get(tourDataKey(tourNanoId, locale), { type: 'json' })
    return (data as TourKvData) ?? null
  } catch {
    return null
  }
}

export async function resolveOrgSlugFromKv(orgSlug: string): Promise<OrgSlugKvEntry | null> {
  const kv = getKv()
  if (!kv) return null
  try {
    const data = await kv.get(orgSlugKey(orgSlug), { type: 'json' })
    return (data as OrgSlugKvEntry) ?? null
  } catch {
    return null
  }
}

export async function resolveTourSlugFromKv(orgSlug: string, tourSlug: string): Promise<TourSlugKvEntry | null> {
  const kv = getKv()
  if (!kv) return null
  try {
    const data = await kv.get(tourSlugKey(orgSlug, tourSlug), { type: 'json' })
    return (data as TourSlugKvEntry) ?? null
  } catch {
    return null
  }
}

// ── Write helpers ────────────────────────────────────────────────

export async function writeTourToKv(tourNanoId: string, locale: string, data: TourKvData): Promise<void> {
  const kv = getKv()
  if (!kv) return
  try {
    await kv.put(tourDataKey(tourNanoId, locale), JSON.stringify(data))
  } catch {
    // Silently fail — KV write failure shouldn't break the request
  }
}

export async function writeOrgSlugToKv(slug: string, data: OrgSlugKvEntry): Promise<void> {
  const kv = getKv()
  if (!kv) return
  try {
    await kv.put(orgSlugKey(slug), JSON.stringify(data))
  } catch {
    // Silently fail
  }
}

export async function writeTourSlugToKv(orgSlug: string, tourSlug: string, data: TourSlugKvEntry): Promise<void> {
  const kv = getKv()
  if (!kv) return
  try {
    await kv.put(tourSlugKey(orgSlug, tourSlug), JSON.stringify(data))
  } catch {
    // Silently fail
  }
}
