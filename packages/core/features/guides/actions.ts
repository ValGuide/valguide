'use server'

import { db } from '@valguide/core/features/db'
import { guide, guideTranslation, stop, stopTranslation } from './schema'
import { organizationMember } from '../orgs/schema'
import { guideAsset, stopAsset } from '@valguide/core/features/assets/schema'
import { eq, and, isNull, isNotNull, inArray } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { createClient } from '@valguide/supabase/server'

async function requireUser() {
  const supabase = await createClient()
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()

  if (claimsError || !claimsData?.claims?.sub) {
    throw new Error('Unauthorized')
  }
  return { id: claimsData.claims.sub }
}

async function checkGuideAccess(guideId: string, userId: string) {
  const [foundGuide] = await db
    .select({ organizationId: guide.organizationId })
    .from(guide)
    .where(eq(guide.id, guideId))
    .limit(1)

  if (!foundGuide) {
    throw new Error('Guide not found')
  }

  const [membership] = await db
    .select()
    .from(organizationMember)
    .where(and(eq(organizationMember.organizationId, foundGuide.organizationId), eq(organizationMember.userId, userId)))
    .limit(1)

  if (!membership) {
    throw new Error('Unauthorized: You do not have access to this guide')
  }
}

async function requireGuideAccess(guideId: string) {
  const user = await requireUser()
  await checkGuideAccess(guideId, user.id)
  return user
}

async function requireStopAccess(stopId: string) {
  const [foundStop] = await db.select({ guideId: stop.guideId }).from(stop).where(eq(stop.id, stopId)).limit(1)

  if (!foundStop) {
    throw new Error('Stop not found')
  }

  return requireGuideAccess(foundStop.guideId)
}

// Guide actions

export type UpdateGuideParams = {
  id: string
  coverImage?: string | null
  published?: Date | null
  organizationId?: string | null
  userId?: string // Ignored, used from session
}

export async function updateGuide(params: UpdateGuideParams) {
  const { id, coverImage, published, organizationId } = params
  const user = await requireGuideAccess(id)

  const [updatedGuide] = await db
    .update(guide)
    .set({
      coverImage: coverImage ?? undefined,
      published: published ?? undefined,
      organizationId: organizationId ?? undefined,
      updatedBy: user.id,
      updatedAt: new Date(),
    })
    .where(eq(guide.id, id))
    .returning()

  return updatedGuide
}

export type UpdateGuideTranslationParams = {
  guideId: string
  locale: string
  title: string
  description: string
}

export async function updateGuideTranslation(params: UpdateGuideTranslationParams) {
  const { guideId, locale, title, description } = params
  await requireGuideAccess(guideId)

  // Use the new upsertGuideTranslationDraft function
  const { upsertGuideTranslationDraft } = await import('./translation-mutations')

  const versionId = await upsertGuideTranslationDraft(guideId, locale, { title, description })

  return { versionId }
}

// Stop actions

export type CreateStopParams = {
  guideId: string
  userId?: string
  order: number
  translations: Array<{
    locale: string
    title: string
    description: string
    transcription: string
  }>
}

export async function createStop(params: CreateStopParams) {
  const { guideId, order, translations } = params
  const user = await requireGuideAccess(guideId)
  const userId = user.id

  const nanoId = nanoid(21)

  const [newStop] = await db
    .insert(stop)
    .values({
      guideId,
      nanoId,
      order,
      createdBy: userId,
    })
    .returning()

  if (!newStop) {
    throw new Error('Failed to create stop')
  }

  // Create translations
  const { upsertStopTranslationDraft } = await import('./translation-mutations')

  for (const trans of translations) {
    await upsertStopTranslationDraft(
      newStop.id,
      trans.locale,
      {
        title: trans.title,
        description: trans.description,
        transcription: trans.transcription,
      },
      userId,
    )
  }

  const fullStop = await db.query.stop.findFirst({
    where: eq(stop.id, newStop.id),
    with: {
      translations: {
        with: {
          draftVersion: true,
          currentVersion: true,
        },
      },
    },
  })

  if (!fullStop) {
    throw new Error('Failed to fetch created stop')
  }

  return fullStop
}

export type UpdateStopParams = {
  stopId: string
  locale: string
  title: string
  description: string
  transcription: string
}

export async function updateStop(params: UpdateStopParams) {
  const { stopId, locale, title, description, transcription } = params
  await requireStopAccess(stopId)

  // Use the new upsertStopTranslationDraft function
  const { upsertStopTranslationDraft } = await import('./translation-mutations')

  const versionId = await upsertStopTranslationDraft(stopId, locale, { title, description, transcription })

  return { versionId }
}

export async function deleteStop(stopId: string) {
  await requireStopAccess(stopId)
  await db.delete(stop).where(eq(stop.id, stopId))

  return { success: true }
}

export type ReorderStopsParams = Array<{ id: string; order: number }>

export async function reorderStops(updates: ReorderStopsParams) {
  const user = await requireUser()

  if (updates.length > 0) {
    const stopIds = updates.map((u) => u.id)
    const stopsToCheck = await db
      .select({ id: stop.id, guideId: stop.guideId })
      .from(stop)
      .where(inArray(stop.id, stopIds))

    const guideIds: string[] = Array.from(new Set(stopsToCheck.map((s: { guideId: string }) => s.guideId)))
    for (const gId of guideIds) {
      await checkGuideAccess(gId, user.id)
    }
  }

  for (const update of updates) {
    await db.update(stop).set({ order: update.order }).where(eq(stop.id, update.id))
  }

  return { success: true }
}

// Asset attachment actions

export type AttachAssetToGuideParams = {
  guideId: string
  assetId: string
  role: string
  locale?: string
  order?: number
}

export async function attachAssetToGuide(params: AttachAssetToGuideParams) {
  const { guideId, assetId, role, locale, order = 0 } = params
  await requireGuideAccess(guideId)

  const [attachment] = await db
    .insert(guideAsset)
    .values({
      guideId,
      assetId,
      role,
      locale: locale || null,
      order,
    })
    .returning()

  return attachment
}

export type AttachAssetToStopParams = {
  stopId: string
  assetId: string
  role: string
  locale?: string
  order?: number
}

export async function attachAssetToStop(params: AttachAssetToStopParams) {
  const { stopId, assetId, role, locale, order = 0 } = params
  await requireStopAccess(stopId)

  const [attachment] = await db
    .insert(stopAsset)
    .values({
      stopId,
      assetId,
      role,
      locale: locale || null,
      order,
    })
    .returning()

  return attachment
}

export async function detachAssetFromGuide(guideAssetId: string) {
  const [asset] = await db
    .select({ guideId: guideAsset.guideId })
    .from(guideAsset)
    .where(eq(guideAsset.id, guideAssetId))
    .limit(1)

  if (!asset) {
    throw new Error('Asset attachment not found')
  }

  await requireGuideAccess(asset.guideId)
  await db.delete(guideAsset).where(eq(guideAsset.id, guideAssetId))

  return { success: true }
}

export async function detachAssetFromStop(stopAssetId: string) {
  const [asset] = await db
    .select({ stopId: stopAsset.stopId })
    .from(stopAsset)
    .where(eq(stopAsset.id, stopAssetId))
    .limit(1)

  if (!asset) {
    throw new Error('Asset attachment not found')
  }

  await requireStopAccess(asset.stopId)
  await db.delete(stopAsset).where(eq(stopAsset.id, stopAssetId))

  return { success: true }
}

export type ArchiveGuideParams = {
  id: string
  userId?: string
}

export async function archiveGuide(params: ArchiveGuideParams) {
  const { id } = params
  const user = await requireGuideAccess(id)
  const userId = user.id

  const [archivedGuide] = await db
    .update(guide)
    .set({
      archivedAt: new Date(),
      updatedBy: userId,
      updatedAt: new Date(),
    })
    .where(eq(guide.id, id))
    .returning()

  return archivedGuide
}

export type RecoverGuideParams = {
  id: string
  userId?: string
}

export async function recoverGuide(params: RecoverGuideParams) {
  const { id } = params
  const user = await requireGuideAccess(id)
  const userId = user.id

  const [recoveredGuide] = await db
    .update(guide)
    .set({
      archivedAt: null,
      updatedBy: userId,
      updatedAt: new Date(),
    })
    .where(and(eq(guide.id, id), isNotNull(guide.archivedAt), isNull(guide.deletedAt)))
    .returning()

  return recoveredGuide
}

export type DeleteGuideParams = {
  id: string
  userId?: string
}

export async function deleteGuide(params: DeleteGuideParams) {
  const { id } = params
  const user = await requireGuideAccess(id)
  const userId = user.id

  const [deletedGuide] = await db
    .update(guide)
    .set({
      deletedAt: new Date(),
      updatedBy: userId,
      updatedAt: new Date(),
    })
    .where(and(eq(guide.id, id), isNotNull(guide.archivedAt)))
    .returning()

  return deletedGuide
}
