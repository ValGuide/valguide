import { and, eq } from 'drizzle-orm'
import { NotFoundError } from '../../auth/authorization'
import { type DB, db } from '../../db'
import {
  guide,
  guideAsset,
  guideAssetDraft,
  guideLocale,
  guideLocaleDraft,
  guideSettings,
  guideSettingsDraft,
  guideStop,
  guideStopDraft,
  stopLocale,
  stopLocaleDraft,
} from '../schema'

export type PublishGuideInput = {
  nanoId: string
  locale: string
}

export type PublishGuideResult = {
  success: boolean
  publishedStopCount: number
}

type Tx = Parameters<Parameters<DB['transaction']>[0]>[0]

async function publishGuideLocaleTx(tx: Tx, guideId: string, locale: string, userId: string): Promise<void> {
  const [draft] = await tx
    .select({
      title: guideLocaleDraft.title,
      description: guideLocaleDraft.description,
    })
    .from(guideLocaleDraft)
    .where(and(eq(guideLocaleDraft.guideId, guideId), eq(guideLocaleDraft.locale, locale)))
    .limit(1)

  if (!draft) return

  await tx
    .insert(guideLocale)
    .values({
      guideId,
      locale,
      title: draft.title,
      description: draft.description,
      publishedAt: new Date(),
      publishedBy: userId,
    })
    .onConflictDoUpdate({
      target: [guideLocale.guideId, guideLocale.locale],
      set: {
        title: draft.title,
        description: draft.description,
        publishedAt: new Date(),
        publishedBy: userId,
      },
    })
}

async function publishGuideSettingsTx(tx: Tx, guideId: string, userId: string): Promise<void> {
  const [draft] = await tx
    .select({
      themeId: guideSettingsDraft.themeId,
      settingsJson: guideSettingsDraft.settingsJson,
    })
    .from(guideSettingsDraft)
    .where(eq(guideSettingsDraft.guideId, guideId))
    .limit(1)

  if (!draft) return

  await tx
    .insert(guideSettings)
    .values({
      guideId,
      themeId: draft.themeId,
      settingsJson: draft.settingsJson,
      publishedAt: new Date(),
      publishedBy: userId,
    })
    .onConflictDoUpdate({
      target: [guideSettings.guideId],
      set: {
        themeId: draft.themeId,
        settingsJson: draft.settingsJson,
        publishedAt: new Date(),
        publishedBy: userId,
      },
    })
}

async function publishGuideStructureTx(tx: Tx, guideId: string): Promise<string[]> {
  const drafts = await tx
    .select({
      stopId: guideStopDraft.stopId,
      position: guideStopDraft.position,
      visible: guideStopDraft.visible,
    })
    .from(guideStopDraft)
    .where(eq(guideStopDraft.guideId, guideId))

  await tx.delete(guideStop).where(eq(guideStop.guideId, guideId))

  if (drafts.length > 0) {
    await tx.insert(guideStop).values(
      drafts.map((d) => ({
        guideId,
        stopId: d.stopId,
        position: d.position,
        visible: d.visible,
        publishedAt: new Date(),
      })),
    )
  }

  return drafts.map((d) => d.stopId)
}

async function publishGuideAssetsTx(tx: Tx, guideId: string): Promise<void> {
  const drafts = await tx
    .select({
      assetId: guideAssetDraft.assetId,
      channel: guideAssetDraft.channel,
      locale: guideAssetDraft.locale,
      position: guideAssetDraft.position,
    })
    .from(guideAssetDraft)
    .where(eq(guideAssetDraft.guideId, guideId))

  await tx.delete(guideAsset).where(eq(guideAsset.guideId, guideId))

  if (drafts.length > 0) {
    await tx.insert(guideAsset).values(
      drafts.map((d) => ({
        guideId,
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

export async function publishGuide(input: PublishGuideInput, userId: string): Promise<PublishGuideResult> {
  const [foundGuide] = await db.select({ id: guide.id }).from(guide).where(eq(guide.nanoId, input.nanoId)).limit(1)

  if (!foundGuide) {
    throw new NotFoundError('Guide')
  }

  let publishedStopCount = 0

  await db.transaction(async (tx) => {
    await publishGuideLocaleTx(tx, foundGuide.id, input.locale, userId)

    const stopIds = await publishGuideStructureTx(tx, foundGuide.id)

    await publishGuideSettingsTx(tx, foundGuide.id, userId)

    await publishGuideAssetsTx(tx, foundGuide.id)

    for (const stopId of stopIds) {
      await publishStopLocaleTx(tx, stopId, input.locale, userId)
    }

    publishedStopCount = stopIds.length
  })

  return { success: true, publishedStopCount }
}
