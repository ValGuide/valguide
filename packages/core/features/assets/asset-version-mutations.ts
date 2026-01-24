import { db } from '@valguide/core/features/db'
import { valguideVersionId } from '@valguide/core/utils/nanoid'
import { eq } from 'drizzle-orm'
import { guideAsset, guideAssetVersion, stopAsset, stopAssetVersion } from './schema'

type AssetInput = {
  assetId: string
  order: number
  role: string
  locale?: string | null
}

// ============================================================================
// Guide Asset Version Mutations
// ============================================================================

/**
 * Create or update a draft guide asset version.
 * If no guideAsset exists, creates one.
 * If draft exists, replaces its items.
 * If no draft exists, creates new version with UUIDv7 versionId.
 */
export async function upsertGuideAssetVersionDraft(
  guideId: string,
  assets: AssetInput[],
  userId: string,
): Promise<string> {
  return db.transaction(async (tx) => {
    // Find or create guideAsset intermediate record
    let guideAssetRecord = await tx.query.guideAsset.findFirst({
      where: eq(guideAsset.guideId, guideId),
    })

    if (!guideAssetRecord) {
      const [newRecord] = await tx.insert(guideAsset).values({ guideId }).returning()

      if (!newRecord) {
        throw new Error('Failed to create guide asset record')
      }
      guideAssetRecord = newRecord
    }

    const guideAssetId = guideAssetRecord.id
    let versionId = guideAssetRecord.draftVersionId

    if (versionId) {
      // Draft exists - delete existing items for this version
      await tx.delete(guideAssetVersion).where(eq(guideAssetVersion.versionId, versionId))
    } else {
      // No draft - generate new UUIDv7 versionId
      versionId = valguideVersionId()

      // Update pointer to new draft
      await tx.update(guideAsset).set({ draftVersionId: versionId }).where(eq(guideAsset.id, guideAssetId))
    }

    // Insert new items (all sharing the same versionId)
    if (assets.length > 0) {
      await tx.insert(guideAssetVersion).values(
        assets.map((a) => ({
          guideAssetId,
          versionId,
          assetId: a.assetId,
          order: a.order,
          role: a.role,
          locale: a.locale ?? null,
          createdBy: userId,
        })),
      )
    }

    return versionId
  })
}

/**
 * Publish guide asset draft.
 * Sets publishedAt, promotes draft to current, clears draft pointer.
 */
export async function publishGuideAssetVersion(guideId: string): Promise<{ success: boolean; error?: string }> {
  return db.transaction(async (tx) => {
    const guideAssetRecord = await tx.query.guideAsset.findFirst({
      where: eq(guideAsset.guideId, guideId),
    })

    if (!guideAssetRecord?.draftVersionId) {
      return { success: false, error: 'No draft assets to publish' }
    }

    const draftVersionId = guideAssetRecord.draftVersionId

    // Set publishedAt timestamp on all items in this version
    await tx
      .update(guideAssetVersion)
      .set({ publishedAt: new Date() })
      .where(eq(guideAssetVersion.versionId, draftVersionId))

    // Update pointers: draft becomes current, clear draft
    await tx
      .update(guideAsset)
      .set({
        currentVersionId: draftVersionId,
        draftVersionId: null,
      })
      .where(eq(guideAsset.id, guideAssetRecord.id))

    return { success: true }
  })
}

/**
 * Discard guide asset draft.
 * Deletes the draft version items and clears the pointer.
 */
export async function discardGuideAssetVersionDraft(guideId: string): Promise<boolean> {
  return db.transaction(async (tx) => {
    const guideAssetRecord = await tx.query.guideAsset.findFirst({
      where: eq(guideAsset.guideId, guideId),
    })

    if (!guideAssetRecord?.draftVersionId) {
      return false
    }

    // Delete draft version items
    await tx.delete(guideAssetVersion).where(eq(guideAssetVersion.versionId, guideAssetRecord.draftVersionId))

    // Clear pointer
    await tx.update(guideAsset).set({ draftVersionId: null }).where(eq(guideAsset.id, guideAssetRecord.id))

    return true
  })
}

/**
 * Unpublish guide assets.
 * Creates a draft from current published, clears current pointer.
 */
export async function unpublishGuideAssetVersion(
  guideId: string,
  userId: string,
): Promise<{ success: boolean; error?: string }> {
  return db.transaction(async (tx) => {
    const guideAssetRecord = await tx.query.guideAsset.findFirst({
      where: eq(guideAsset.guideId, guideId),
    })

    if (!guideAssetRecord?.currentVersionId) {
      return { success: false, error: 'No published assets to unpublish' }
    }

    // If no draft exists, create one from the published version's items
    if (!guideAssetRecord.draftVersionId) {
      const currentItems = await tx.query.guideAssetVersion.findMany({
        where: eq(guideAssetVersion.versionId, guideAssetRecord.currentVersionId),
      })

      // Generate new UUIDv7 for the draft
      const newVersionId = valguideVersionId()

      if (currentItems.length > 0) {
        await tx.insert(guideAssetVersion).values(
          currentItems.map((item) => ({
            guideAssetId: guideAssetRecord.id,
            versionId: newVersionId,
            assetId: item.assetId,
            order: item.order,
            role: item.role,
            locale: item.locale,
            createdBy: userId,
          })),
        )
      }

      // Update pointers
      await tx
        .update(guideAsset)
        .set({
          currentVersionId: null,
          draftVersionId: newVersionId,
        })
        .where(eq(guideAsset.id, guideAssetRecord.id))
    } else {
      // Draft exists, just clear current pointer
      await tx.update(guideAsset).set({ currentVersionId: null }).where(eq(guideAsset.id, guideAssetRecord.id))
    }

    return { success: true }
  })
}

// ============================================================================
// Stop Asset Version Mutations
// ============================================================================

/**
 * Create or update a draft stop asset version.
 */
export async function upsertStopAssetVersionDraft(
  stopId: string,
  assets: AssetInput[],
  userId: string,
): Promise<string> {
  return db.transaction(async (tx) => {
    // Find or create stopAsset intermediate record
    let stopAssetRecord = await tx.query.stopAsset.findFirst({
      where: eq(stopAsset.stopId, stopId),
    })

    if (!stopAssetRecord) {
      const [newRecord] = await tx.insert(stopAsset).values({ stopId }).returning()

      if (!newRecord) {
        throw new Error('Failed to create stop asset record')
      }
      stopAssetRecord = newRecord
    }

    const stopAssetId = stopAssetRecord.id
    let versionId = stopAssetRecord.draftVersionId

    if (versionId) {
      // Draft exists - delete existing items for this version
      await tx.delete(stopAssetVersion).where(eq(stopAssetVersion.versionId, versionId))
    } else {
      // No draft - generate new UUIDv7 versionId
      versionId = valguideVersionId()

      // Update pointer to new draft
      await tx.update(stopAsset).set({ draftVersionId: versionId }).where(eq(stopAsset.id, stopAssetId))
    }

    // Insert new items (all sharing the same versionId)
    if (assets.length > 0) {
      await tx.insert(stopAssetVersion).values(
        assets.map((a) => ({
          stopAssetId,
          versionId,
          assetId: a.assetId,
          order: a.order,
          role: a.role,
          locale: a.locale ?? null,
          createdBy: userId,
        })),
      )
    }

    return versionId
  })
}

/**
 * Publish stop asset draft.
 */
export async function publishStopAssetVersion(stopId: string): Promise<{ success: boolean; error?: string }> {
  return db.transaction(async (tx) => {
    const stopAssetRecord = await tx.query.stopAsset.findFirst({
      where: eq(stopAsset.stopId, stopId),
    })

    if (!stopAssetRecord?.draftVersionId) {
      return { success: false, error: 'No draft assets to publish' }
    }

    const draftVersionId = stopAssetRecord.draftVersionId

    // Set publishedAt timestamp on all items in this version
    await tx
      .update(stopAssetVersion)
      .set({ publishedAt: new Date() })
      .where(eq(stopAssetVersion.versionId, draftVersionId))

    // Update pointers: draft becomes current, clear draft
    await tx
      .update(stopAsset)
      .set({
        currentVersionId: draftVersionId,
        draftVersionId: null,
      })
      .where(eq(stopAsset.id, stopAssetRecord.id))

    return { success: true }
  })
}

/**
 * Discard stop asset draft.
 */
export async function discardStopAssetVersionDraft(stopId: string): Promise<boolean> {
  return db.transaction(async (tx) => {
    const stopAssetRecord = await tx.query.stopAsset.findFirst({
      where: eq(stopAsset.stopId, stopId),
    })

    if (!stopAssetRecord?.draftVersionId) {
      return false
    }

    // Delete draft version items
    await tx.delete(stopAssetVersion).where(eq(stopAssetVersion.versionId, stopAssetRecord.draftVersionId))

    // Clear pointer
    await tx.update(stopAsset).set({ draftVersionId: null }).where(eq(stopAsset.id, stopAssetRecord.id))

    return true
  })
}

/**
 * Unpublish stop assets.
 */
export async function unpublishStopAssetVersion(
  stopId: string,
  userId: string,
): Promise<{ success: boolean; error?: string }> {
  return db.transaction(async (tx) => {
    const stopAssetRecord = await tx.query.stopAsset.findFirst({
      where: eq(stopAsset.stopId, stopId),
    })

    if (!stopAssetRecord?.currentVersionId) {
      return { success: false, error: 'No published assets to unpublish' }
    }

    // If no draft exists, create one from the published version's items
    if (!stopAssetRecord.draftVersionId) {
      const currentItems = await tx.query.stopAssetVersion.findMany({
        where: eq(stopAssetVersion.versionId, stopAssetRecord.currentVersionId),
      })

      // Generate new UUIDv7 for the draft
      const newVersionId = valguideVersionId()

      if (currentItems.length > 0) {
        await tx.insert(stopAssetVersion).values(
          currentItems.map((item) => ({
            stopAssetId: stopAssetRecord.id,
            versionId: newVersionId,
            assetId: item.assetId,
            order: item.order,
            role: item.role,
            locale: item.locale,
            createdBy: userId,
          })),
        )
      }

      // Update pointers
      await tx
        .update(stopAsset)
        .set({
          currentVersionId: null,
          draftVersionId: newVersionId,
        })
        .where(eq(stopAsset.id, stopAssetRecord.id))
    } else {
      // Draft exists, just clear current pointer
      await tx.update(stopAsset).set({ currentVersionId: null }).where(eq(stopAsset.id, stopAssetRecord.id))
    }

    return { success: true }
  })
}
