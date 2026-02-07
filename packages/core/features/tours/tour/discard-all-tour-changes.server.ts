import { and, eq } from 'drizzle-orm'
import { NotFoundError } from '../../auth/authorization'
import { type DB, db } from '../../db'
import {
  stopLocale,
  stopLocaleDraft,
  tour,
  tourAsset,
  tourAssetDraft,
  tourLocale,
  tourLocaleDraft,
  tourSettings,
  tourSettingsDraft,
  tourStop,
  tourStopDraft,
} from '../schema'

type Tx = Parameters<Parameters<DB['transaction']>[0]>[0]

async function discardTourLocaleTx(tx: Tx, tourId: string, locale: string): Promise<void> {
  const [published] = await tx
    .select({
      title: tourLocale.title,
      description: tourLocale.description,
    })
    .from(tourLocale)
    .where(and(eq(tourLocale.tourId, tourId), eq(tourLocale.locale, locale)))
    .limit(1)

  if (!published) return

  await tx
    .update(tourLocaleDraft)
    .set({
      title: published.title,
      description: published.description,
    })
    .where(and(eq(tourLocaleDraft.tourId, tourId), eq(tourLocaleDraft.locale, locale)))
}

async function discardTourSettingsTx(tx: Tx, tourId: string): Promise<void> {
  const [published] = await tx
    .select({
      themeId: tourSettings.themeId,
      settingsJson: tourSettings.settingsJson,
    })
    .from(tourSettings)
    .where(eq(tourSettings.tourId, tourId))
    .limit(1)

  if (!published) {
    await tx.delete(tourSettingsDraft).where(eq(tourSettingsDraft.tourId, tourId))
    return
  }

  const [existingDraft] = await tx
    .select({ id: tourSettingsDraft.id })
    .from(tourSettingsDraft)
    .where(eq(tourSettingsDraft.tourId, tourId))
    .limit(1)

  if (existingDraft) {
    await tx
      .update(tourSettingsDraft)
      .set({
        themeId: published.themeId,
        settingsJson: published.settingsJson,
      })
      .where(eq(tourSettingsDraft.tourId, tourId))
  } else {
    await tx.insert(tourSettingsDraft).values({
      tourId,
      themeId: published.themeId,
      settingsJson: published.settingsJson,
    })
  }
}

async function discardTourStructureTx(tx: Tx, tourId: string): Promise<string[]> {
  const published = await tx
    .select({
      stopId: tourStop.stopId,
      position: tourStop.position,
      visible: tourStop.visible,
    })
    .from(tourStop)
    .where(eq(tourStop.tourId, tourId))

  await tx.delete(tourStopDraft).where(eq(tourStopDraft.tourId, tourId))

  if (published.length > 0) {
    await tx.insert(tourStopDraft).values(
      published.map((p) => ({
        tourId,
        stopId: p.stopId,
        position: p.position,
        visible: p.visible,
      })),
    )
  }

  return published.map((p) => p.stopId)
}

async function discardTourAssetsTx(tx: Tx, tourId: string): Promise<void> {
  const published = await tx
    .select({
      assetId: tourAsset.assetId,
      channel: tourAsset.channel,
      locale: tourAsset.locale,
      position: tourAsset.position,
    })
    .from(tourAsset)
    .where(eq(tourAsset.tourId, tourId))

  await tx.delete(tourAssetDraft).where(eq(tourAssetDraft.tourId, tourId))

  if (published.length > 0) {
    await tx.insert(tourAssetDraft).values(
      published.map((p) => ({
        tourId,
        assetId: p.assetId,
        channel: p.channel,
        locale: p.locale,
        position: p.position,
      })),
    )
  }
}

async function discardStopLocaleTx(tx: Tx, stopId: string, locale: string): Promise<void> {
  const [published] = await tx
    .select({
      title: stopLocale.title,
      description: stopLocale.description,
      transcription: stopLocale.transcription,
    })
    .from(stopLocale)
    .where(and(eq(stopLocale.stopId, stopId), eq(stopLocale.locale, locale)))
    .limit(1)

  if (!published) return

  await tx
    .update(stopLocaleDraft)
    .set({
      title: published.title,
      description: published.description,
      transcription: published.transcription,
    })
    .where(and(eq(stopLocaleDraft.stopId, stopId), eq(stopLocaleDraft.locale, locale)))
}

export async function discardAllTourChanges(tourNanoId: string, locale: string): Promise<void> {
  const [foundTour] = await db
    .select({ id: tour.id, publishedAt: tour.publishedAt })
    .from(tour)
    .where(eq(tour.nanoId, tourNanoId))
    .limit(1)

  if (!foundTour) {
    throw new NotFoundError('Tour')
  }

  if (!foundTour.publishedAt) {
    throw new Error('Cannot discard changes: tour has never been published')
  }

  await db.transaction(async (tx) => {
    await discardTourLocaleTx(tx, foundTour.id, locale)

    await discardTourSettingsTx(tx, foundTour.id)

    const stopIds = await discardTourStructureTx(tx, foundTour.id)

    await discardTourAssetsTx(tx, foundTour.id)

    for (const stopId of stopIds) {
      await discardStopLocaleTx(tx, stopId, locale)
    }
  })
}
