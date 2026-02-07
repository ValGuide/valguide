import { and, eq } from 'drizzle-orm'
import { NotFoundError } from '../../auth/authorization'
import { type DB, db } from '../../db'
import {
  stop,
  stopAsset,
  stopAssetDraft,
  stopLocale,
  stopLocaleDraft,
  stopSettings,
  stopSettingsDraft,
} from '../schema'

type Tx = Parameters<Parameters<DB['transaction']>[0]>[0]

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

async function discardStopSettingsTx(tx: Tx, stopId: string): Promise<void> {
  const [published] = await tx
    .select({
      coordinates: stopSettings.coordinates,
      settingsJson: stopSettings.settingsJson,
    })
    .from(stopSettings)
    .where(eq(stopSettings.stopId, stopId))
    .limit(1)

  if (!published) {
    await tx.delete(stopSettingsDraft).where(eq(stopSettingsDraft.stopId, stopId))
    return
  }

  const [existingDraft] = await tx
    .select({ id: stopSettingsDraft.id })
    .from(stopSettingsDraft)
    .where(eq(stopSettingsDraft.stopId, stopId))
    .limit(1)

  if (existingDraft) {
    await tx
      .update(stopSettingsDraft)
      .set({
        coordinates: published.coordinates,
        settingsJson: published.settingsJson,
      })
      .where(eq(stopSettingsDraft.stopId, stopId))
  } else {
    await tx.insert(stopSettingsDraft).values({
      stopId,
      coordinates: published.coordinates,
      settingsJson: published.settingsJson,
    })
  }
}

async function discardStopAssetsTx(tx: Tx, stopId: string): Promise<void> {
  const published = await tx
    .select({
      assetId: stopAsset.assetId,
      channel: stopAsset.channel,
      locale: stopAsset.locale,
      position: stopAsset.position,
    })
    .from(stopAsset)
    .where(eq(stopAsset.stopId, stopId))

  await tx.delete(stopAssetDraft).where(eq(stopAssetDraft.stopId, stopId))

  if (published.length > 0) {
    await tx.insert(stopAssetDraft).values(
      published.map((p) => ({
        stopId,
        assetId: p.assetId,
        channel: p.channel,
        locale: p.locale,
        position: p.position,
      })),
    )
  }
}

export async function discardAllStopChanges(stopNanoId: string, locale: string): Promise<void> {
  const [foundStop] = await db.select({ id: stop.id }).from(stop).where(eq(stop.nanoId, stopNanoId)).limit(1)

  if (!foundStop) {
    throw new NotFoundError('Stop')
  }

  const [hasPublishedLocale] = await db
    .select({ id: stopLocale.id })
    .from(stopLocale)
    .where(eq(stopLocale.stopId, foundStop.id))
    .limit(1)

  if (!hasPublishedLocale) {
    throw new Error('Cannot discard changes: stop has never been published')
  }

  await db.transaction(async (tx) => {
    await discardStopLocaleTx(tx, foundStop.id, locale)
    await discardStopSettingsTx(tx, foundStop.id)
    await discardStopAssetsTx(tx, foundStop.id)
  })
}
