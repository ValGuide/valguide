'use server'

import { db } from '@valguide/core/features/db'
import { guide, guideTranslation, stop, stopTranslation } from './schema'
import { guideAsset, stopAsset } from '@valguide/core/features/assets/schema'
import { eq, and, isNull, isNotNull } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { revalidatePath } from 'next/cache'
import { createClient } from '@valguide/supabase/server'

async function getUser() {
  const supabase = await createClient()
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()

  if (claimsError || !claimsData?.claims?.sub) {
    throw new Error('Unauthorized')
  }
  return { id: claimsData.claims.sub }
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
  const user = await getUser()

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

  revalidatePath(`/guides/[nanoId]`, 'page')
  return updatedGuide
}

export type UpdateGuideTranslationParams = {
  guideId: string
  locale: string
  title: string
  description: string
}

export async function updateGuideTranslation(params: UpdateGuideTranslationParams) {
  await getUser()
  const { guideId, locale, title, description } = params

  // Use the new upsertGuideTranslationDraft function
  const { upsertGuideTranslationDraft } = await import('./translation-mutations')
  
  const versionId = await upsertGuideTranslationDraft(
    guideId,
    locale,
    { title, description },
  )

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
  const user = await getUser()
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
  const createdTranslations = []
  for (const trans of translations) {
    const [translation] = await db
      .insert(stopTranslation)
      .values({
        stopId: newStop.id,
        locale: trans.locale,
        title: trans.title,
        description: trans.description,
        transcription: trans.transcription,
      })
      .returning()
    createdTranslations.push(translation)
  }

  revalidatePath(`/guides/[nanoId]/edit`, 'page')

  return {
    ...newStop,
    translations: createdTranslations,
  }
}

export type UpdateStopParams = {
  stopId: string
  locale: string
  title: string
  description: string
  transcription: string
}

export async function updateStop(params: UpdateStopParams) {
  await getUser()
  const { stopId, locale, title, description, transcription } = params

  // Use the new upsertStopTranslationDraft function
  const { upsertStopTranslationDraft } = await import('./translation-mutations')
  
  const versionId = await upsertStopTranslationDraft(
    stopId,
    locale,
    { title, description, transcription },
  )

  return { versionId }
}

export async function deleteStop(stopId: string) {
  await getUser()
  await db.delete(stop).where(eq(stop.id, stopId))

  revalidatePath(`/guides/[nanoId]/edit`, 'page')
  return { success: true }
}

export type ReorderStopsParams = Array<{ id: string; order: number }>

export async function reorderStops(updates: ReorderStopsParams) {
  await getUser()
  for (const update of updates) {
    await db.update(stop).set({ order: update.order }).where(eq(stop.id, update.id))
  }

  revalidatePath(`/guides/[nanoId]/edit`, 'page')
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
  await getUser()
  const { guideId, assetId, role, locale, order = 0 } = params

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

  revalidatePath(`/guides/[nanoId]/edit`, 'page')
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
  await getUser()
  const { stopId, assetId, role, locale, order = 0 } = params

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

  revalidatePath(`/guides/[nanoId]/edit`, 'page')
  return attachment
}

export async function detachAssetFromGuide(guideAssetId: string) {
  await getUser()
  await db.delete(guideAsset).where(eq(guideAsset.id, guideAssetId))

  revalidatePath(`/guides/[nanoId]/edit`, 'page')
  return { success: true }
}

export async function detachAssetFromStop(stopAssetId: string) {
  await getUser()
  await db.delete(stopAsset).where(eq(stopAsset.id, stopAssetId))

  revalidatePath(`/guides/[nanoId]/edit`, 'page')
  return { success: true }
}

export type ArchiveGuideParams = {
  id: string
  userId?: string
}

export async function archiveGuide(params: ArchiveGuideParams) {
  const { id } = params
  const user = await getUser()
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

  revalidatePath('/', 'page')
  return archivedGuide
}

export type RecoverGuideParams = {
  id: string
  userId?: string
}

export async function recoverGuide(params: RecoverGuideParams) {
  const { id } = params
  const user = await getUser()
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

  revalidatePath('/', 'page')
  revalidatePath('/archived', 'page')
  return recoveredGuide
}

export type DeleteGuideParams = {
  id: string
  userId?: string
}

export async function deleteGuide(params: DeleteGuideParams) {
  const { id } = params
  const user = await getUser()
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

  revalidatePath('/archived', 'page')
  return deletedGuide
}
