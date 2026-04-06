/**
 * KV read/write helpers for tour data edge caching.
 *
 * Key patterns:
 *   tour:{nanoId}:{locale}           → TourKvData
 *   tour-shared:{nanoId}             → TourSharedKvData
 *   org-slug:{slug}                  → OrgSlugKvEntry
 *   tour-slug:{orgSlug}:{tourSlug}   → TourSlugKvEntry
 *
 * All helpers return null / no-op gracefully when KV is unavailable
 * (e.g. local dev without Cloudflare bindings).
 */

import { env } from 'cloudflare:workers'
import type { OrgSlugKvEntry, TourKvData, TourSharedKvData, TourSlugKvEntry } from './kv-types'

function getKv(): KVNamespace | null {
  try {
    return env.TOUR_DATA ?? null
  } catch {
    console.error('[tour-kv] KV binding TOUR_DATA not available')
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

function tourSharedKey(nanoId: string): string {
  return `tour-shared:${nanoId}`
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
  } catch (err) {
    console.error('[tour-kv] Failed to read tour', tourNanoId, locale, err)
    return null
  }
}

export async function resolveOrgSlugFromKv(orgSlug: string): Promise<OrgSlugKvEntry | null> {
  const kv = getKv()
  if (!kv) return null
  try {
    const data = await kv.get(orgSlugKey(orgSlug), { type: 'json' })
    return (data as OrgSlugKvEntry) ?? null
  } catch (err) {
    console.error('[tour-kv] Failed to resolve org slug', orgSlug, err)
    return null
  }
}

export async function readTourSharedFromKv(tourNanoId: string): Promise<TourSharedKvData | null> {
  const kv = getKv()
  if (!kv) return null
  try {
    const data = await kv.get(tourSharedKey(tourNanoId), { type: 'json' })
    return (data as TourSharedKvData) ?? null
  } catch (err) {
    console.error('[tour-kv] Failed to read shared tour data', tourNanoId, err)
    return null
  }
}

export async function resolveTourSlugFromKv(orgSlug: string, tourSlug: string): Promise<TourSlugKvEntry | null> {
  const kv = getKv()
  if (!kv) return null
  try {
    const data = await kv.get(tourSlugKey(orgSlug, tourSlug), { type: 'json' })
    return (data as TourSlugKvEntry) ?? null
  } catch (err) {
    console.error('[tour-kv] Failed to resolve tour slug', orgSlug, tourSlug, err)
    return null
  }
}

// ── Write helpers ────────────────────────────────────────────────

export async function writeTourToKv(tourNanoId: string, locale: string, data: TourKvData): Promise<void> {
  const kv = getKv()
  if (!kv) return
  try {
    await kv.put(tourDataKey(tourNanoId, locale), JSON.stringify(data))
  } catch (err) {
    console.error('[tour-kv] Failed to write tour', tourNanoId, locale, err)
  }
}

export async function writeTourSharedToKv(tourNanoId: string, data: TourSharedKvData): Promise<void> {
  const kv = getKv()
  if (!kv) return
  try {
    await kv.put(tourSharedKey(tourNanoId), JSON.stringify(data))
  } catch (err) {
    console.error('[tour-kv] Failed to write shared tour data', tourNanoId, err)
  }
}

export async function writeOrgSlugToKv(slug: string, data: OrgSlugKvEntry): Promise<void> {
  const kv = getKv()
  if (!kv) return
  try {
    await kv.put(orgSlugKey(slug), JSON.stringify(data))
  } catch (err) {
    console.error('[tour-kv] Failed to write org slug', slug, err)
  }
}

export async function writeTourSlugToKv(orgSlug: string, tourSlug: string, data: TourSlugKvEntry): Promise<void> {
  const kv = getKv()
  if (!kv) return
  try {
    await kv.put(tourSlugKey(orgSlug, tourSlug), JSON.stringify(data))
  } catch (err) {
    console.error('[tour-kv] Failed to write tour slug', orgSlug, tourSlug, err)
  }
}

// ── Delete helpers ───────────────────────────────────────────────

export async function deleteTourFromKv(tourNanoId: string, locale: string): Promise<void> {
  const kv = getKv()
  if (!kv) return
  try {
    await kv.delete(tourDataKey(tourNanoId, locale))
  } catch (err) {
    console.error('[tour-kv] Failed to delete tour', tourNanoId, locale, err)
  }
}

export async function deleteTourSharedFromKv(tourNanoId: string): Promise<void> {
  const kv = getKv()
  if (!kv) return
  try {
    await kv.delete(tourSharedKey(tourNanoId))
  } catch (err) {
    console.error('[tour-kv] Failed to delete shared tour data', tourNanoId, err)
  }
}

export async function deleteTourAllLocalesFromKv(tourNanoId: string, locales: string[]): Promise<void> {
  const kv = getKv()
  if (!kv) return
  try {
    await Promise.all(locales.map((locale) => kv.delete(tourDataKey(tourNanoId, locale))))
  } catch (err) {
    console.error('[tour-kv] Failed to delete tour locales', tourNanoId, locales, err)
  }
}

export async function deleteTourSlugFromKv(orgSlug: string, tourSlug: string): Promise<void> {
  const kv = getKv()
  if (!kv) return
  try {
    await kv.delete(tourSlugKey(orgSlug, tourSlug))
  } catch (err) {
    console.error('[tour-kv] Failed to delete tour slug', orgSlug, tourSlug, err)
  }
}
