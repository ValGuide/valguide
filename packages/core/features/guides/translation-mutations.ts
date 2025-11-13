import { eq, and, max } from 'drizzle-orm'
import { db } from '../db'
import {
  guideTranslation,
  guideTranslationVersion,
  stopTranslation,
  stopTranslationVersion,
  type NewGuideTranslationVersion,
  type NewStopTranslationVersion,
} from './schema'

/**
 * Create or update a draft guide translation
 * If no draft exists, creates version 1 or increments max version
 * If draft exists, updates it in place
 */
export async function upsertGuideTranslationDraft(
  guideId: string,
  locale: string,
  data: {
    title: string
    description?: string | null
  },
  userId?: string,
): Promise<string> {
  // Find or create translation identity row
  let translation = await db
    .select()
    .from(guideTranslation)
    .where(and(eq(guideTranslation.guideId, guideId), eq(guideTranslation.locale, locale)))
    .limit(1)

  let translationId: string

  if (!translation[0]) {
    // Create new translation identity
    const [newTranslation] = await db
      .insert(guideTranslation)
      .values({
        guideId,
        locale,
      })
      .returning()
    translationId = newTranslation.id
  } else {
    translationId = translation[0].id

    // If draft already exists, update it
    if (translation[0].draftVersionId) {
      await db
        .update(guideTranslationVersion)
        .set({
          title: data.title,
          description: data.description,
        })
        .where(eq(guideTranslationVersion.id, translation[0].draftVersionId))

      return translation[0].draftVersionId
    }
  }

  // No existing draft, create new version
  // Get max version number
  const maxVersionResult = await db
    .select({ maxVer: max(guideTranslationVersion.version) })
    .from(guideTranslationVersion)
    .where(eq(guideTranslationVersion.translationId, translationId))

  const nextVersion = (maxVersionResult[0]?.maxVer || 0) + 1

  // Create new draft version
  const [newVersion] = await db
    .insert(guideTranslationVersion)
    .values({
      translationId,
      version: nextVersion,
      status: 'draft',
      title: data.title,
      description: data.description,
      createdBy: userId,
    })
    .returning()

  // Update translation to point to new draft
  await db
    .update(guideTranslation)
    .set({
      draftVersionId: newVersion.id,
    })
    .where(eq(guideTranslation.id, translationId))

  return newVersion.id
}

/**
 * Publish a draft guide translation
 * Sets status to 'published', updates current_version_id pointer, clears draft_version_id
 */
export async function publishGuideTranslationDraft(
  guideId: string,
  locale: string,
): Promise<{ success: boolean; versionId?: string; error?: string }> {
  const translation = await db
    .select()
    .from(guideTranslation)
    .where(and(eq(guideTranslation.guideId, guideId), eq(guideTranslation.locale, locale)))
    .limit(1)

  if (!translation[0]) {
    return { success: false, error: 'Translation not found' }
  }

  if (!translation[0].draftVersionId) {
    return { success: false, error: 'No draft to publish' }
  }

  const draftId = translation[0].draftVersionId

  await db.transaction(async (tx: typeof db) => {
    // Update draft version to published
    await tx
      .update(guideTranslationVersion)
      .set({
        status: 'published',
        publishedAt: new Date(),
      })
      .where(eq(guideTranslationVersion.id, draftId))

    // Update translation pointers
    await tx
      .update(guideTranslation)
      .set({
        currentVersionId: draftId,
        draftVersionId: null,
      })
      .where(eq(guideTranslation.id, translation[0].id))
  })

  return { success: true, versionId: draftId }
}

/**
 * Rollback to a previous version
 * Creates a new draft based on the specified version
 */
export async function rollbackGuideTranslation(
  guideId: string,
  locale: string,
  targetVersion: number,
  userId?: string,
): Promise<{ success: boolean; draftId?: string; error?: string }> {
  const translation = await db
    .select()
    .from(guideTranslation)
    .where(and(eq(guideTranslation.guideId, guideId), eq(guideTranslation.locale, locale)))
    .limit(1)

  if (!translation[0]) {
    return { success: false, error: 'Translation not found' }
  }

  // Find target version
  const targetVersionData = await db
    .select()
    .from(guideTranslationVersion)
    .where(
      and(
        eq(guideTranslationVersion.translationId, translation[0].id),
        eq(guideTranslationVersion.version, targetVersion),
      ),
    )
    .limit(1)

  if (!targetVersionData[0]) {
    return { success: false, error: 'Target version not found' }
  }

  // Get max version to create new version
  const maxVersionResult = await db
    .select({ maxVer: max(guideTranslationVersion.version) })
    .from(guideTranslationVersion)
    .where(eq(guideTranslationVersion.translationId, translation[0].id))

  const nextVersion = (maxVersionResult[0]?.maxVer || 0) + 1

  // Create new draft with content from target version
  const [newDraft] = await db
    .insert(guideTranslationVersion)
    .values({
      translationId: translation[0].id,
      version: nextVersion,
      status: 'draft',
      title: targetVersionData[0].title,
      description: targetVersionData[0].description,
      createdBy: userId,
    })
    .returning()

  // Update translation to point to new draft
  await db
    .update(guideTranslation)
    .set({
      draftVersionId: newDraft.id,
    })
    .where(eq(guideTranslation.id, translation[0].id))

  return { success: true, draftId: newDraft.id }
}

/**
 * Delete a draft translation version
 */
export async function deleteGuideTranslationDraft(guideId: string, locale: string): Promise<boolean> {
  const translation = await db
    .select()
    .from(guideTranslation)
    .where(and(eq(guideTranslation.guideId, guideId), eq(guideTranslation.locale, locale)))
    .limit(1)

  if (!translation[0] || !translation[0].draftVersionId) {
    return false
  }

  await db.transaction(async (tx: typeof db) => {
    // Delete draft version
    await tx.delete(guideTranslationVersion).where(eq(guideTranslationVersion.id, translation[0].draftVersionId!))

    // Clear draft pointer
    await tx
      .update(guideTranslation)
      .set({
        draftVersionId: null,
      })
      .where(eq(guideTranslation.id, translation[0].id))
  })

  return true
}

// ========== STOP TRANSLATION MUTATIONS ==========

/**
 * Create or update a draft stop translation
 */
export async function upsertStopTranslationDraft(
  stopId: string,
  locale: string,
  data: {
    title: string
    description?: string | null
    transcription?: string | null
  },
  userId?: string,
): Promise<string> {
  let translation = await db
    .select()
    .from(stopTranslation)
    .where(and(eq(stopTranslation.stopId, stopId), eq(stopTranslation.locale, locale)))
    .limit(1)

  let translationId: string

  if (!translation[0]) {
    const [newTranslation] = await db
      .insert(stopTranslation)
      .values({
        stopId,
        locale,
      })
      .returning()
    translationId = newTranslation.id
  } else {
    translationId = translation[0].id

    if (translation[0].draftVersionId) {
      await db
        .update(stopTranslationVersion)
        .set({
          title: data.title,
          description: data.description,
          transcription: data.transcription,
        })
        .where(eq(stopTranslationVersion.id, translation[0].draftVersionId))

      return translation[0].draftVersionId
    }
  }

  const maxVersionResult = await db
    .select({ maxVer: max(stopTranslationVersion.version) })
    .from(stopTranslationVersion)
    .where(eq(stopTranslationVersion.translationId, translationId))

  const nextVersion = (maxVersionResult[0]?.maxVer || 0) + 1

  const [newVersion] = await db
    .insert(stopTranslationVersion)
    .values({
      translationId,
      version: nextVersion,
      status: 'draft',
      title: data.title,
      description: data.description,
      transcription: data.transcription,
      createdBy: userId,
    })
    .returning()

  await db
    .update(stopTranslation)
    .set({
      draftVersionId: newVersion.id,
    })
    .where(eq(stopTranslation.id, translationId))

  return newVersion.id
}

/**
 * Publish a draft stop translation
 */
export async function publishStopTranslationDraft(
  stopId: string,
  locale: string,
): Promise<{ success: boolean; versionId?: string; error?: string }> {
  const translation = await db
    .select()
    .from(stopTranslation)
    .where(and(eq(stopTranslation.stopId, stopId), eq(stopTranslation.locale, locale)))
    .limit(1)

  if (!translation[0]) {
    return { success: false, error: 'Translation not found' }
  }

  if (!translation[0].draftVersionId) {
    return { success: false, error: 'No draft to publish' }
  }

  const draftId = translation[0].draftVersionId

  await db.transaction(async (tx: typeof db) => {
    await tx
      .update(stopTranslationVersion)
      .set({
        status: 'published',
        publishedAt: new Date(),
      })
      .where(eq(stopTranslationVersion.id, draftId))

    await tx
      .update(stopTranslation)
      .set({
        currentVersionId: draftId,
        draftVersionId: null,
      })
      .where(eq(stopTranslation.id, translation[0].id))
  })

  return { success: true, versionId: draftId }
}

/**
 * Rollback to a previous version
 */
export async function rollbackStopTranslation(
  stopId: string,
  locale: string,
  targetVersion: number,
  userId?: string,
): Promise<{ success: boolean; draftId?: string; error?: string }> {
  const translation = await db
    .select()
    .from(stopTranslation)
    .where(and(eq(stopTranslation.stopId, stopId), eq(stopTranslation.locale, locale)))
    .limit(1)

  if (!translation[0]) {
    return { success: false, error: 'Translation not found' }
  }

  const targetVersionData = await db
    .select()
    .from(stopTranslationVersion)
    .where(
      and(
        eq(stopTranslationVersion.translationId, translation[0].id),
        eq(stopTranslationVersion.version, targetVersion),
      ),
    )
    .limit(1)

  if (!targetVersionData[0]) {
    return { success: false, error: 'Target version not found' }
  }

  const maxVersionResult = await db
    .select({ maxVer: max(stopTranslationVersion.version) })
    .from(stopTranslationVersion)
    .where(eq(stopTranslationVersion.translationId, translation[0].id))

  const nextVersion = (maxVersionResult[0]?.maxVer || 0) + 1

  const [newDraft] = await db
    .insert(stopTranslationVersion)
    .values({
      translationId: translation[0].id,
      version: nextVersion,
      status: 'draft',
      title: targetVersionData[0].title,
      description: targetVersionData[0].description,
      transcription: targetVersionData[0].transcription,
      createdBy: userId,
    })
    .returning()

  await db
    .update(stopTranslation)
    .set({
      draftVersionId: newDraft.id,
    })
    .where(eq(stopTranslation.id, translation[0].id))

  return { success: true, draftId: newDraft.id }
}

/**
 * Delete a draft translation version
 */
export async function deleteStopTranslationDraft(stopId: string, locale: string): Promise<boolean> {
  const translation = await db
    .select()
    .from(stopTranslation)
    .where(and(eq(stopTranslation.stopId, stopId), eq(stopTranslation.locale, locale)))
    .limit(1)

  if (!translation[0] || !translation[0].draftVersionId) {
    return false
  }

  await db.transaction(async (tx: typeof db) => {
    await tx.delete(stopTranslationVersion).where(eq(stopTranslationVersion.id, translation[0].draftVersionId!))

    await tx
      .update(stopTranslation)
      .set({
        draftVersionId: null,
      })
      .where(eq(stopTranslation.id, translation[0].id))
  })

  return true
}
