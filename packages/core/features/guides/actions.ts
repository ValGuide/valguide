'use server'

import { db } from '@valguide/core/features/db'
import { guide, guideTranslation, stop, stopTranslation } from './schema'
import { guideAsset, stopAsset } from '@valguide/core/features/assets/schema'
import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { revalidatePath } from 'next/cache'

// Guide actions

export type UpdateGuideParams = {
  id: string
  coverImage?: string | null
  published?: Date | null
  organizationId?: string | null
  userId: string
}

export async function updateGuide(params: UpdateGuideParams) {
  const { id, coverImage, published, organizationId, userId } = params

  const [updatedGuide] = await db
    .update(guide)
    .set({
      coverImage: coverImage ?? undefined,
      published: published ?? undefined,
      organizationId: organizationId ?? undefined,
      updatedBy: userId,
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
  const { guideId, locale, title, description } = params

  // Check if translation exists
  const existing = await db.query.guideTranslation.findFirst({
    where: (fields, { and, eq }) => and(eq(fields.guideId, guideId), eq(fields.locale, locale)),
  })

  if (existing) {
    // Update existing translation
    const [updated] = await db
      .update(guideTranslation)
      .set({
        title,
        description,
        updatedAt: new Date(),
      })
      .where(eq(guideTranslation.id, existing.id))
      .returning()

    return updated
  } else {
    // Create new translation
    const [created] = await db
      .insert(guideTranslation)
      .values({
        guideId,
        locale,
        title,
        description,
      })
      .returning()

    return created
  }
}

// Stop actions

export type CreateStopParams = {
  guideId: string
  userId: string
  order: number
  translations: Array<{
    locale: string
    title: string
    description: string
    transcription: string
  }>
}

export async function createStop(params: CreateStopParams) {
  const { guideId, userId, order, translations } = params

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
    const [translation] = await db.insert(stopTranslation).values({
      stopId: newStop.id,
      locale: trans.locale,
      title: trans.title,
      description: trans.description,
      transcription: trans.transcription,
    }).returning()
    createdTranslations.push(translation)
  }

  revalidatePath(`/guides/[nanoId]/edit`, 'page')
  
  return {
    ...newStop,
    translations: createdTranslations
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
  const { stopId, locale, title, description, transcription } = params

  // Check if translation exists
  const existing = await db.query.stopTranslation.findFirst({
    where: (fields, { and, eq }) => and(eq(fields.stopId, stopId), eq(fields.locale, locale)),
  })

  if (existing) {
    // Update existing translation
    const [updated] = await db
      .update(stopTranslation)
      .set({
        title,
        description,
        transcription,
        updatedAt: new Date(),
      })
      .where(eq(stopTranslation.id, existing.id))
      .returning()

    return updated
  } else {
    // Create new translation
    const [created] = await db
      .insert(stopTranslation)
      .values({
        stopId,
        locale,
        title,
        description,
        transcription,
      })
      .returning()

    return created
  }
}

export async function deleteStop(stopId: string) {
  await db.delete(stop).where(eq(stop.id, stopId))

  revalidatePath(`/guides/[nanoId]/edit`, 'page')
  return { success: true }
}

export type ReorderStopsParams = Array<{ id: string; order: number }>

export async function reorderStops(updates: ReorderStopsParams) {
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
  await db.delete(guideAsset).where(eq(guideAsset.id, guideAssetId))

  revalidatePath(`/guides/[nanoId]/edit`, 'page')
  return { success: true }
}

export async function detachAssetFromStop(stopAssetId: string) {
  await db.delete(stopAsset).where(eq(stopAsset.id, stopAssetId))

  revalidatePath(`/guides/[nanoId]/edit`, 'page')
  return { success: true }
}
