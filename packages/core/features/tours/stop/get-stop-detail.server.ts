import { and, eq, isNull } from 'drizzle-orm'
import { db } from '../../db'
import { stop, stopLocale, stopLocaleDraft, stopSettingsDraft } from '../schema'

// =============================================================================
// TYPES
// =============================================================================

export type StopLocaleDraftInfo = {
  locale: string
  title: string | null
  description: string | null
  transcription: string | null
  hasPublished: boolean
}

export type StopDetail = {
  id: string
  nanoId: string
  organizationId: string
  /** Locales derived from stopLocaleDraft records (locales that have been created for this stop) */
  existingLocales: string[]
  /** @deprecated Use existingLocales - kept for backward compatibility during migration */
  availableLocales: string[]
  archivedAt: Date | null
  createdAt: Date
  updatedAt: Date
  locales: StopLocaleDraftInfo[]
  settings: {
    coordinates: string | null
    settingsJson: string | null
  } | null
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function getStopDetail(nanoId: string): Promise<StopDetail | null> {
  const [foundStop] = await db
    .select()
    .from(stop)
    .where(and(eq(stop.nanoId, nanoId), isNull(stop.deletedAt)))
    .limit(1)

  if (!foundStop) return null

  // Get all draft locales
  const draftRows = await db
    .select({
      locale: stopLocaleDraft.locale,
      title: stopLocaleDraft.title,
      description: stopLocaleDraft.description,
      transcription: stopLocaleDraft.transcription,
    })
    .from(stopLocaleDraft)
    .where(eq(stopLocaleDraft.stopId, foundStop.id))

  // Get published locales to determine hasPublished
  const publishedRows = await db
    .select({ locale: stopLocale.locale })
    .from(stopLocale)
    .where(eq(stopLocale.stopId, foundStop.id))

  const publishedLocaleSet = new Set(publishedRows.map((r) => r.locale))

  const locales: StopLocaleDraftInfo[] = draftRows.map((row) => ({
    locale: row.locale,
    title: row.title,
    description: row.description,
    transcription: row.transcription,
    hasPublished: publishedLocaleSet.has(row.locale),
  }))

  // Derive existingLocales from stopLocaleDraft records (the source of truth)
  const existingLocales = locales.map((l) => l.locale)

  const [settings] = await db
    .select({
      coordinates: stopSettingsDraft.coordinates,
      settingsJson: stopSettingsDraft.settingsJson,
    })
    .from(stopSettingsDraft)
    .where(eq(stopSettingsDraft.stopId, foundStop.id))
    .limit(1)

  return {
    id: foundStop.id,
    nanoId: foundStop.nanoId,
    organizationId: foundStop.organizationId,
    existingLocales,
    availableLocales: existingLocales, // Deprecated: alias for backward compatibility
    archivedAt: foundStop.archivedAt,
    createdAt: foundStop.createdAt,
    updatedAt: foundStop.updatedAt,
    locales,
    settings: settings ?? null,
  }
}
