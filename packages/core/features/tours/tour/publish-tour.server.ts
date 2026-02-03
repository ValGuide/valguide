import { and, eq } from 'drizzle-orm'
import { NotFoundError } from '../../auth/authorization'
import { type DB, db } from '../../db'
import {
  tour,
  tourAsset,
  tourAssetDraft,
  tourLocale,
  tourLocaleDraft,
  tourSettings,
  tourSettingsDraft,
  tourStop,
  tourStopDraft,
  stopLocale,
  stopLocaleDraft,
} from '../schema'

export type PublishTourInput = {
  nanoId: string
  locale: string
}

export type PublishTourResult = {
  success: boolean
  publishedStopCount: number
}

type Tx = Parameters<Parameters<DB['transaction']>[0]>[0]

async function publishTourLocaleTx(tx: Tx, tourId: string, locale: string, userId: string): Promise<void> {
  const [draft] = await tx
    .select({
      title: tourLocaleDraft.title,
      description: tourLocaleDraft.description,
    })
    .from(tourLocaleDraft)
    .where(and(eq(tourLocaleDraft.tourId, tourId), eq(tourLocaleDraft.locale, locale)))
    .limit(1)

  if (!draft) return

  await tx
    .insert(tourLocale)
    .values({
      tourId,
      locale,
      title: draft.title,
      description: draft.description,
      publishedAt: new Date(),
      publishedBy: userId,
    })
    .onConflictDoUpdate({
      target: [tourLocale.tourId, tourLocale.locale],
      set: {
        title: draft.title,
        description: draft.description,
        publishedAt: new Date(),
        publishedBy: userId,
      },
    })
}

async function publishTourSettingsTx(tx: Tx, tourId: string, userId: string): Promise<void> {
  const [draft] = await tx
    .select({
      themeId: tourSettingsDraft.themeId,
      settingsJson: tourSettingsDraft.settingsJson,
    })
    .from(tourSettingsDraft)
    .where(eq(tourSettingsDraft.tourId, tourId))
    .limit(1)

  if (!draft) return

  await tx
    .insert(tourSettings)
    .values({
      tourId,
      themeId: draft.themeId,
      settingsJson: draft.settingsJson,
      publishedAt: new Date(),
      publishedBy: userId,
    })
    .onConflictDoUpdate({
      target: [tourSettings.tourId],
      set: {
        themeId: draft.themeId,
        settingsJson: draft.settingsJson,
        publishedAt: new Date(),
        publishedBy: userId,
      },
    })
}

async function publishTourStructureTx(tx: Tx, tourId: string): Promise<string[]> {
  const drafts = await tx
    .select({
      stopId: tourStopDraft.stopId,
      position: tourStopDraft.position,
      visible: tourStopDraft.visible,
    })
    .from(tourStopDraft)
    .where(eq(tourStopDraft.tourId, tourId))

  await tx.delete(tourStop).where(eq(tourStop.tourId, tourId))

  if (drafts.length > 0) {
    await tx.insert(tourStop).values(
      drafts.map((d) => ({
        tourId,
        stopId: d.stopId,
        position: d.position,
        visible: d.visible,
        publishedAt: new Date(),
      })),
    )
  }

  return drafts.map((d) => d.stopId)
}

async function publishTourAssetsTx(tx: Tx, tourId: string): Promise<void> {
  const drafts = await tx
    .select({
      assetId: tourAssetDraft.assetId,
      channel: tourAssetDraft.channel,
      locale: tourAssetDraft.locale,
      position: tourAssetDraft.position,
    })
    .from(tourAssetDraft)
    .where(eq(tourAssetDraft.tourId, tourId))

  await tx.delete(tourAsset).where(eq(tourAsset.tourId, tourId))

  if (drafts.length > 0) {
    await tx.insert(tourAsset).values(
      drafts.map((d) => ({
        tourId,
        assetId: d.assetId,
        channel: d.channel,
        locale: d.locale,
        position: d.position,
        publishedAt: new Date(),
      })),
    )
  }
}

async function publishStopLocaleTx(tx: Tx, stopId: string, locale: string, userId: string): Promise<void> {
  const [draft] = await tx
    .select({
      title: stopLocaleDraft.title,
      description: stopLocaleDraft.description,
      transcription: stopLocaleDraft.transcription,
    })
    .from(stopLocaleDraft)
    .where(and(eq(stopLocaleDraft.stopId, stopId), eq(stopLocaleDraft.locale, locale)))
    .limit(1)

  if (!draft) return

  await tx
    .insert(stopLocale)
    .values({
      stopId,
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
}

export async function publishTour(input: PublishTourInput, userId: string): Promise<PublishTourResult> {
  const [foundTour] = await db.select({ id: tour.id }).from(tour).where(eq(tour.nanoId, input.nanoId)).limit(1)

  if (!foundTour) {
    throw new NotFoundError('Tour')
  }

  let publishedStopCount = 0

  await db.transaction(async (tx) => {
    await publishTourLocaleTx(tx, foundTour.id, input.locale, userId)

    const stopIds = await publishTourStructureTx(tx, foundTour.id)

    await publishTourSettingsTx(tx, foundTour.id, userId)

    await publishTourAssetsTx(tx, foundTour.id)

    for (const stopId of stopIds) {
      await publishStopLocaleTx(tx, stopId, input.locale, userId)
    }

    publishedStopCount = stopIds.length
  })

  return { success: true, publishedStopCount }
}
