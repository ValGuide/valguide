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

import { createOptionalKvNamespace } from '../../platform/kv-namespace.server'
import type { OrgSlugKvEntry, TourKvData, TourSharedKvData, TourSlugKvEntry } from './kv-types'

const tourDataKv = createOptionalKvNamespace('TOUR_DATA', { logPrefix: '[tour-kv]' })

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
  return tourDataKv.readJson<TourKvData>(tourDataKey(tourNanoId, locale))
}

export async function resolveOrgSlugFromKv(orgSlug: string): Promise<OrgSlugKvEntry | null> {
  return tourDataKv.readJson<OrgSlugKvEntry>(orgSlugKey(orgSlug))
}

export async function readTourSharedFromKv(tourNanoId: string): Promise<TourSharedKvData | null> {
  return tourDataKv.readJson<TourSharedKvData>(tourSharedKey(tourNanoId))
}

export async function resolveTourSlugFromKv(orgSlug: string, tourSlug: string): Promise<TourSlugKvEntry | null> {
  return tourDataKv.readJson<TourSlugKvEntry>(tourSlugKey(orgSlug, tourSlug))
}

export async function writeTourToKv(tourNanoId: string, locale: string, data: TourKvData): Promise<void> {
  await tourDataKv.writeJson(tourDataKey(tourNanoId, locale), data)
}

export async function writeTourSharedToKv(tourNanoId: string, data: TourSharedKvData): Promise<void> {
  await tourDataKv.writeJson(tourSharedKey(tourNanoId), data)
}

export async function writeOrgSlugToKv(slug: string, data: OrgSlugKvEntry): Promise<void> {
  await tourDataKv.writeJson(orgSlugKey(slug), data)
}

export async function writeTourSlugToKv(orgSlug: string, tourSlug: string, data: TourSlugKvEntry): Promise<void> {
  await tourDataKv.writeJson(tourSlugKey(orgSlug, tourSlug), data)
}

export async function deleteTourFromKv(tourNanoId: string, locale: string): Promise<void> {
  await tourDataKv.delete(tourDataKey(tourNanoId, locale))
}

export async function deleteTourSharedFromKv(tourNanoId: string): Promise<void> {
  await tourDataKv.delete(tourSharedKey(tourNanoId))
}

export async function deleteTourAllLocalesFromKv(tourNanoId: string, locales: string[]): Promise<void> {
  await tourDataKv.deleteMany(locales.map((locale) => tourDataKey(tourNanoId, locale)))
}

export async function deleteTourSlugFromKv(orgSlug: string, tourSlug: string): Promise<void> {
  await tourDataKv.delete(tourSlugKey(orgSlug, tourSlug))
}
