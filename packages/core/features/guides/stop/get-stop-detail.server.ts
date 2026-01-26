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
  revision: number
  hasUnpublishedChanges: boolean
  publishedVersionId: string | null
}

export type StopDetail = {
  id: string
  nanoId: string
  organizationId: string
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

  const localeRows = await db
    .select({
      locale: stopLocale.locale,
      title: stopLocaleDraft.title,
      description: stopLocaleDraft.description,
      transcription: stopLocaleDraft.transcription,
      revision: stopLocaleDraft.revision,
      publishedVersionId: stopLocale.publishedVersionId,
      lastPublishedDraftRevision: stopLocale.lastPublishedDraftRevision,
    })
    .from(stopLocale)
    .innerJoin(stopLocaleDraft, eq(stopLocaleDraft.id, stopLocale.draftId))
    .where(eq(stopLocale.stopId, foundStop.id))

  const locales: StopLocaleDraftInfo[] = localeRows.map((row) => ({
    locale: row.locale,
    title: row.title,
    description: row.description,
    transcription: row.transcription,
    revision: row.revision,
    hasUnpublishedChanges: row.publishedVersionId === null || row.revision !== row.lastPublishedDraftRevision,
    publishedVersionId: row.publishedVersionId,
  }))

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
    availableLocales: foundStop.availableLocales ?? [],
    archivedAt: foundStop.archivedAt,
    createdAt: foundStop.createdAt,
    updatedAt: foundStop.updatedAt,
    locales,
    settings: settings ?? null,
  }
}
